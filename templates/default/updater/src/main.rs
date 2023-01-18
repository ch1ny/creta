use std::{env, process};

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

fn win32_update(pid: &str, exe: &str) {
    // TODO: 待实现
    exec_args(
        "taskkill",
        ["/pid", pid, "/T", "/F"].to_vec(),
        "终止应用时发生错误！",
    );
    exec_args(exe, [].to_vec(), "重启应用时发生错误！");
}

fn darwin_update(pid: &str, exe: &str) {
    exec_args(
        "tar",
        ["-zxvf", "update.tar.gz"].to_vec(),
        "解压缩更新包时发生错误！",
    );
    exec_args("kill", ["-9", pid].to_vec(), "终止应用时发生错误！");
    exec_args(
        "cp",
        ["-r", "update", "../"].to_vec(),
        "拷贝更新文件时发生错误！",
    );
    exec_args("open", [exe].to_vec(), "重启应用时发生错误！");
    exec_args(
        "rm",
        ["-rf", "update.tar.gz"].to_vec(),
        "删除更新包时发生错误！",
    );
    exec_args(
        "rm",
        ["-rf", "update/"].to_vec(),
        "删除更新文件时发生错误！",
    );
}

fn linux_update(pid: &str, exe: &str) {
    exec_args(
        "tar",
        ["-zxvf", "update.tar.gz"].to_vec(),
        "解压缩更新包时发生错误！",
    );
    exec_args("kill", ["-9", pid].to_vec(), "终止应用时发生错误！");
    exec_args(
        "cp",
        ["-r", "update", "../"].to_vec(),
        "拷贝更新文件时发生错误！",
    );
    exec_args("open", [exe].to_vec(), "重启应用时发生错误！");
    exec_args(
        "rm",
        ["-rf", "update.tar.gz"].to_vec(),
        "删除更新包时发生错误！",
    );
    exec_args(
        "rm",
        ["-rf", "update/"].to_vec(),
        "删除更新文件时发生错误！",
    );
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 4 {
        println!("参数非法！");
        process::exit(-1);
    }

    // if cfg!(target_os = "windows") {

    // } else if cfg!(target_os = "macos") {

    // } else if cfg!(target_os = "linux") {

    // }

    if args[1].eq("win32") {
        win32_update(&args[2], &args[3]);
    } else if args[1].eq("darwin") {
        darwin_update(&args[2], &args[3]);
    } else if args[1].eq("linux") {
        linux_update(&args[2], &args[3]);
    } else {
        println!("暂不支持当前平台 => {}", args[1]);
        process::exit(-1);
    }
}
