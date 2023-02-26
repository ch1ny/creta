use clap::{arg, Arg, Command};

mod compress;
mod extract;

fn main() {
    let app = Command::new("eup")
        .subcommand(
            Command::new("compress")
                .alias("c")
                .arg(arg!(-i <INPUT> "输入文件地址"))
                .arg(arg!(-o <OUTPUT> "输出文件地址"))
                .arg(
                    Arg::new("dir")
                        .long("dir")
                        .short('d')
                        .action(clap::ArgAction::SetTrue),
                )
                .arg_required_else_help(true),
        )
        .subcommand(
            Command::new("expand")
                .alias("e")
                .arg(arg!(-i <INPUT> "输入文件地址"))
                .arg(arg!(-o <OUTPUT> "输出目录"))
                .arg_required_else_help(true),
        );

    match app.get_matches().subcommand() {
        Some(("compress", sub_matches)) => {
            let input_file_path = sub_matches
                .get_one::<String>("INPUT")
                .expect("Please declare file path need to be compressed.");
            let output_file_path = sub_matches
                .get_one::<String>("OUTPUT")
                .expect("Please declare where compressed file located.");
            let with_dir = sub_matches.get_flag("dir");

            println!("{} => {}", input_file_path, output_file_path);

            std::process::exit(compress::exec(
                &input_file_path,
                &output_file_path,
                with_dir,
            ));
        }
        Some(("expand", sub_matches)) => {
            let input_file_path = sub_matches
                .get_one::<String>("INPUT")
                .expect("Please declare file path need to be expanded.");
            let output_file_path = sub_matches
                .get_one::<String>("OUTPUT")
                .expect("Please declare where expanded files located in.");

            println!("{} => {}", input_file_path, output_file_path);

            std::process::exit(extract::exec(&input_file_path, &output_file_path));
        }
        _ => unreachable!(),
    };
}
