#!/usr/bin/env node


const program = require('commander') //命令行提示解决方案实例
const download = require('download-git-repo') //从github上下载
const handlebars = require('handlebars') //解析模板语言和编译拓展模板语言的工具
const inquirer = require('inquirer') //用交互式的界面采取用户输入的值
const fs = require('fs') //nodejs 内置模块
const ora = require('ora') //控制台输入的交互增强微调工具
const chalk = require('chalk') //控制台终端的颜色以及交互方面的微调
const logSymbols = require('log-symbols') //控制台的相关的符号

const templates = require('./templates') //外包js文件


program
  .version('0.1.0') // -v 或者 --version 的时候会输出该版本号

program
  .command('init <template-name> <project-name>')
  .description('初始化项目模板')
  .action((templateName, projectName) => {
    // loading 提示
    const spinner = ora('正在下载模板...').start();
    const downloadUrl = templates[templateName].downloadUrl;

    download(downloadUrl, projectName, { clone: true }, (err) => {
      if (err) {
        spinner.fail()
        console.log(logSymbols.error, chalk.red(err))
        return
      }
      spinner.succeed()
    })

    // 使用向导的方式采集用户输入的值
	  inquirer.prompt([{
	    type: 'input',
	    name: 'name',
	    message: '请输入项目名称',
	    default: projectName
	  }, {
	    type: 'input',
	    name: 'description',
	    message: '请输入项目简介'
	  }, {
	    type: 'input',
	    name: 'author',
	    message: '请输入作者名称'
	  }]).then((answers) => {
	    // 把项目下的 package.json 文件读取出来
	    const packagePath = `${projectName}/package.json`
	    const packageContent = fs.readFileSync(packagePath, 'utf8')

	    // 使用模板引擎把用户输入的数据解析到 package.json 文件中
	    const packageResult = handlebars.compile(packageContent)(answers)

	    // 解析完毕，把解析之后的结果重新写入 package.json 文件中
	    fs.writeFileSync(packagePath, packageResult)

	    console.log(logSymbols.success, chalk.yellow('初始化模板成功'))
	  })


  });


program
  .command('list')
  .description('查看所有可用模板')
  .action(() => {
    for (let key in templates) {
      console.log(`
      ${key}  ${templates[key].description}`)
    }
  })

// 没有任何命令的时候输出使用帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv);