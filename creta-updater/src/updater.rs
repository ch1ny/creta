use std::{path::Path, process};

use clap::{arg, Command};

mod extract;

fn exec_args(cmd: &str, args: Vec<&str>, err_msg: &str) {
    match process::Command::new(cmd).args(args).output() {
        Ok(output) => {
            if output.stderr.len() > 0 {
                println!("{}", err_msg);
                process::exit(-1);
            }
        }
        Err(_err) => {
            println!("Command 执行失败");
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

    // 1. 解压缩更新包
    let eup_path = Path::new("./update.eup");
    if extract::exec(
        &eup_path.to_str().unwrap(),
        &eup_path.parent().unwrap().to_str().unwrap(),
    ) != 0
    {
        println!("解压缩更新包时发生错误！");
        process::exit(-1);
    }

    // 2. 终止应用
    #[cfg(unix)]
    exec_args("kill", ["-9", pid].to_vec(), "终止应用时发生错误！");
    #[cfg(windows)]
    exec_args(
        "taskkill",
        ["/pid", pid, "/T", "/F"].to_vec(),
        "终止应用时发生错误！",
    );

    // 3. 拷贝更新文件
    #[cfg(unix)]
    exec_args(
        "cp",
        ["-r", "update", "../"].to_vec(),
        "拷贝更新文件时发生错误！",
    );
    #[cfg(windows)]
    exec_args(
        "cp",
        ["update/*", "./"].to_vec(),
        "拷贝更新文件时发生错误！",
    );

    // 4. 重启应用
    #[cfg(unix)]
    exec_args("open", [exe].to_vec(), "终止应用时发生错误！");
    #[cfg(windows)]
    exec_args(exe, [].to_vec(), "重启应用时发生错误！");

    // 5. 删除更新文件
    #[cfg(unix)]
    exec_args(
        "rm",
        ["-rf", "update.eup"].to_vec(),
        "删除更新包时发生错误！",
    );
    #[cfg(windows)]
    exec_args(
        "rm",
        ["-r", "update.eup"].to_vec(),
        "删除更新包时发生错误！",
    );
    #[cfg(unix)]
    exec_args("rm", ["-rf", "update/"].to_vec(), "删除更新包时发生错误！");
    #[cfg(windows)]
    exec_args("rm", ["-r", "update/"].to_vec(), "删除更新包时发生错误！");
}
