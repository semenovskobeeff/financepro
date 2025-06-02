#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Порты приложения
const PORTS = {
  SERVER_PORT: 3001,
  CLIENT_PORT: 5175,
  HMR_PORT: 5176,
};

console.log('============================================');
console.log('  ЗАВЕРШЕНИЕ ПРОЦЕССОВ НА ПОРТАХ ПРИЛОЖЕНИЯ');
console.log('============================================');
console.log();

/**
 * Определяет операционную систему
 */
function getOS() {
  const platform = process.platform;
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'macos';
  return 'linux';
}

/**
 * Получает PID процессов на указанном порту
 */
async function getPIDsOnPort(port) {
  try {
    const os = getOS();
    let command;

    switch (os) {
      case 'windows':
        command = `netstat -ano | findstr :${port}`;
        break;
      case 'macos':
      case 'linux':
        command = `lsof -ti :${port}`;
        break;
      default:
        throw new Error(`Неподдерживаемая ОС: ${os}`);
    }

    const { stdout } = await execAsync(command);

    if (os === 'windows') {
      // Для Windows извлекаем PID из вывода netstat
      const lines = stdout
        .split('\n')
        .filter(line => line.includes('LISTENING'));
      const pids = lines
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return parts[parts.length - 1];
        })
        .filter(pid => pid && pid !== '0');
      return [...new Set(pids)]; // Убираем дубликаты
    } else {
      // Для Unix-систем lsof возвращает PID напрямую
      return stdout.split('\n').filter(pid => pid.trim() !== '');
    }
  } catch (error) {
    // Если команда не нашла процессы, это нормально
    return [];
  }
}

/**
 * Завершает процесс по PID
 */
async function killProcess(pid) {
  try {
    const os = getOS();
    let command;

    switch (os) {
      case 'windows':
        command = `taskkill /F /PID ${pid}`;
        break;
      case 'macos':
      case 'linux':
        command = `kill -9 ${pid}`;
        break;
      default:
        throw new Error(`Неподдерживаемая ОС: ${os}`);
    }

    await execAsync(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Завершает все процессы на указанном порту
 */
async function killPortProcesses(port, serviceName) {
  console.log(`🔍 Проверяем порт ${port} (${serviceName})...`);

  try {
    const pids = await getPIDsOnPort(port);

    if (pids.length === 0) {
      console.log(`✅ Порт ${port} свободен`);
      return;
    }

    console.log(`❌ Найдены процессы на порту ${port}: ${pids.join(', ')}`);
    console.log(`🔄 Завершаем процессы...`);

    const killPromises = pids.map(async pid => {
      const success = await killProcess(pid);
      if (success) {
        console.log(`✅ Процесс ${pid} завершен успешно`);
      } else {
        console.log(`⚠️  Не удалось завершить процесс ${pid}`);
      }
      return success;
    });

    await Promise.all(killPromises);

    // Проверяем, что порт действительно освободился
    setTimeout(async () => {
      const remainingPids = await getPIDsOnPort(port);
      if (remainingPids.length === 0) {
        console.log(`✅ Порт ${port} успешно освобожден`);
      } else {
        console.log(
          `⚠️  На порту ${port} все еще есть процессы: ${remainingPids.join(
            ', '
          )}`
        );
      }
    }, 1000);
  } catch (error) {
    console.error(
      `❌ Ошибка при завершении процессов на порту ${port}:`,
      error.message
    );
  }

  console.log();
}

/**
 * Основная функция
 */
async function main() {
  console.log(
    `🔍 Поиск процессов на портах ${Object.values(PORTS).join(', ')}...`
  );
  console.log();

  // Завершаем процессы на всех портах
  await killPortProcesses(PORTS.SERVER_PORT, 'Сервер');
  await killPortProcesses(PORTS.CLIENT_PORT, 'Клиент');
  await killPortProcesses(PORTS.HMR_PORT, 'HMR (Hot Module Replacement)');

  console.log('✅ Очистка портов завершена!');
  console.log('============================================');
}

// Запуск только если файл вызван напрямую
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { killPortProcesses, getPIDsOnPort, killProcess };
