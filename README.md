# Cactus Reactus

a _very_ stupid discord bot that reacts all messages by a given user with a specified emoji

# Installation

Type `npm install` to install necessary packages.

# Environment

Setup a mysql database and username for cactus reactus.

Create a .env file with the format seen in env.template

# Service

(on Ubuntu)

Create a file called `/etc/systemd/system/cactusreactus.service` and in it put:

```
[Unit]
Description=cactus reactus bot server
After=mysqld.service
StartLimitIntervalSec=0

[Service]
Restart=always
RestartSec=1
user=dberard
WorkingDirectory=/home/dberard/cactus-reactus
ExecStart=/usr/local/bin/npm run dev

[Install]
WantedBy=multi-user.target
```

(replace /home/dberard/cactus-reactus with your directory location)

Then, with sudo permissions, run:

```sh
systemctl enable cactusreactus
systemctl start cactusreactus
```
