require('dotenv').config();
var Emoji = require('node-emoji');
const mysql = require('mysql');
const Discord = require('discord.js');
const client = new Discord.Client();
const table_name = 'users';

const con = mysql.createConnection({
	host: 'localhost',
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	charset : 'utf8mb4'
});

con.connect(function(err) {
	if(err) throw err;
	console.log("Connected to MYSQL server!");
	prepare_table(con);
});

const prepare_table = (con) => {
	con.query("SHOW TABLES LIKE '" + table_name + "';", (err, result, fields) => {
		if(err) throw err;
		console.log(result);
		if(result.length === 0) {
			con.query("CREATE TABLE " + table_name + " (username TINYTEXT, reaction TINYTEXT) CHARACTER SET utf8mb4;", (err, result, fields) => {
				setup_client(con);
			});
		} else {
			setup_client(con);
		}
	});
};

const insert_emoji = (con, author, emoji) => {
	console.log("Trying to add " + emoji + " to " + author);
	con.query('INSERT INTO ' + table_name + ' (username, reaction) values (' + con.escape(author) + ", " + con.escape(emoji) + ");", (err, results, fields) => {
		if(err) throw err;
		console.log("Added " + emoji + " to " + author);
	});
};

const setup_client = (con) => {
	client.on('ready', () => {
		console.log(`Logged in as ${client.user.tag}`);
	});

	client.on('message', msg => {
		if(msg.content.startsWith('!reactus')) {
			/*
			let author = msg.mentions.members.first();
			if(!author) return;
			author = author.user.username;
			if(!author) return; */
			let authorz = msg.cleanContent.split(' ');
			let author = -1;
			for(let x of author) {
				if(x.length > 1 && x[0] === '@') {
					author = x.substr(1);
				}
			}
			if(author === -1) return;
			let removal = msg.content.search('remove');
			if(removal !== -1) {
				con.query('DELETE FROM ' + table_name + ' WHERE username=' + con.escape(author) + ';', (err, results, fields) => {
					if(err) throw err;
				});
				return;
			}
			let emoji = Emoji.unemojify(msg.content).split(':');
			if(emoji.length != 3) return;
			emoji = ':' + emoji[1] + ':';
			emoji = Emoji.emojify(emoji);
			console.log(author, ' reactus ', emoji, msg.cleanContent);
			con.query('SELECT reaction FROM ' + table_name + ' WHERE username=' + con.escape(author) + ';', (err, results, fields) => {
				if(err) throw err;
				if(results.length !== 0) {
					con.query('DELETE FROM ' + table_name + ' WHERE username=' + con.escape(author) + ';', (err, results, fields) => {
						if(err) throw err;
						insert_emoji(con, author, emoji);
					});
				} else {
					insert_emoji(con, author, emoji);
				}
			});
		}
		const author = msg.author.username;
		console.log(author);
		con.query('SELECT reaction FROM ' + table_name + ' WHERE username=' + con.escape(author) + ';', (err, results, fields) => {
			if(err) throw err;
			if(results.length !== 0) {
				msg.react(results[0].reaction)
					.then(console.log)
					.catch(console.error);
				console.log(results[0], results[0].reaction);
			}
		});
/*
		msg.react('🌵')
			.then(console.log)
			.catch(console.error); */
	});

	client.login(process.env.BOT_TOKEN);
};
