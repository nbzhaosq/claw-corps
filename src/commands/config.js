/**
 * config 命令 - 管理配置
 */
import chalk from 'chalk';
import { Storage } from '../core/storage.js';

export async function manageConfig(options) {
  if (options.list) {
    console.log(chalk.cyan.bold('\n⚙️  配置列表\n'));
    const config = Storage.getConfig();
    console.log(chalk.gray(JSON.stringify(config, null, 2)));
    console.log();
    return;
  }
  
  if (options.get) {
    console.log(chalk.cyan.bold('\n⚙️  获取配置\n'));
    const config = Storage.getConfig();
    const keys = options.get.split('.');
    let value = config;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (value === undefined) {
      console.log(chalk.yellow('配置项不存在\n'));
    } else {
      console.log(chalk.cyan(`${options.get}:`));
      console.log(chalk.gray(JSON.stringify(value, null, 2)));
      console.log();
    }
    return;
  }
  
  if (options.set) {
    console.log(chalk.cyan.bold('\n⚙️  设置配置\n'));
    
    const [key, ...valueParts] = options.set.split('=');
    let value = valueParts.join('=');
    
    // 尝试解析 JSON
    try {
      value = JSON.parse(value);
    } catch {
      // 保持字符串
    }
    
    Storage.setConfig(key, value);
    
    console.log(chalk.green('✅ 配置已更新\n'));
    console.log(chalk.cyan(`${key} =`));
    console.log(chalk.gray(JSON.stringify(value, null, 2)));
    console.log();
    return;
  }
  
  // 默认显示帮助
  console.log(chalk.cyan.bold('\n⚙️  配置管理\n'));
  console.log('用法:');
  console.log(`  ${chalk.yellow('--list')}              列出所有配置`);
  console.log(`  ${chalk.yellow('--get <key>')}         获取配置值`);
  console.log(`  ${chalk.yellow('--set <key=value>')}   设置配置值`);
  console.log();
  console.log('示例:');
  console.log(`  ${chalk.gray('claw-corps config --list')}`);
  console.log(`  ${chalk.gray('claw-corps config --get defaultTool')}`);
  console.log(`  ${chalk.gray('claw-corps config --set defaultTool=opencode')}`);
  console.log(`  ${chalk.gray('claw-corps config --set logLevel=\\"debug\\"')}`);
  console.log();
}
