use std::{fs, os::windows::process::CommandExt, path::Path, process};

use clap::{arg, Command};

mod extract;

fn exec_args(cmd: &str, args: &Vec<&str>, err_msg: &str) {
    match process::Command::new(cmd)
        .creation_flags(0x08000000)
        .args(args)
        .output()
    {
        Ok(output) => {
            if output.stderr.len() > 0 {
                println!("{}", err_msg);
                process::exit(-1);
            }
        }
        Err(err) => {
            println!("Command 执行失败");
            println!("{}", args.join(" "));
            println!("{}", err);
            process::exit(-1);
        }
    }
}

fn main() {
    let app = Command::new("CretaUpdater")
        .arg(arg!(-p <PID> "Electron Programme PID"))
        .arg(arg!(-e <EXE> "Executable Path"));

    let matches = app.get_matches();

    let pid = matches
        .get_one::<String>("PID")
        .expect("Please input PID of the programme need to be killed.");
    let exe = matches
        .get_one::<String>("EXE")
        .expect("Please input the executable programme path.");

    // 1. 终止应用
    #[cfg(unix)]
    exec_args("kill", &vec!["-9", pid], "终止应用时发生错误！");
    #[cfg(windows)]
    exec_args("taskkill", &vec!["/pid", pid, "/F"], "终止应用时发生错误！");

    // 2. 解压缩更新包
    let eup_path = Path::new("./update.eup");
    if extract::exec(
        eup_path.to_str().unwrap(),
        eup_path.parent().unwrap().to_str().unwrap(),
    ) != 0
    {
        println!("解压缩更新包时发生错误！");
        process::exit(-1);
    }

    // 3. 删除更新文件
    fs::remove_file(eup_path).expect("删除更新包时发生错误！");
    while eup_path.exists() {} // remove_file 不保证立即删除文件

    // 4. 重启应用
    #[cfg(unix)]
    exec_args("open", &vec![exe], "重启应用时发生错误！");
    #[cfg(windows)]
    exec_args(exe, &vec![], "重启应用时发生错误！");
}
