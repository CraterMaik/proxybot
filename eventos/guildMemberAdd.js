const Discord = require('discord.js');
const sqlite = require('sqlite');
sqlite.open('./proxybd.sqlite');

const moment = require("moment")
require('moment-duration-format');

exports.run = (client, member) => {


    const timestamp = new Date();
    const datestats = moment(timestamp).format("DD/MM/YYYY");
    const timestats = moment(timestamp).format("HH:mm:ss");



    //console.log('log new user!');
    sqlite.get(`SELECT * FROM users WHERE userId ="${member.user.id}"`).then(select => {
        if (!select) {

            sqlite.run('INSERT INTO users (userId, name) VALUES (?, ?)', [member.user.id, member.user.username + '#' + member.user.discriminator]);
            console.log('[NEW USERS] - [INGRESO]: ' + member.user.username + '#' + member.user.discriminator + ' (' + member.user.id + ')');

            // sqlite.run('INSERT INTO historiales (idusu, tipo, descripcion, fecha, hora) VALUES (?, ?, ?, ?, ?)', [user.id, 'ban', 'BanAdd in: '+guild.name, datestats, timestats]);
            sqlite.run('INSERT INTO historiales (idusu, tipo, descripcion, fecha, hora) VALUES (?, ?, ?, ?, ?)', [member.user.id, 'log', 'Ingreso a: ' + member.guild.name, datestats, timestats]);
            console.log('[HISTORIAL] - [LOG] - [INGRESO]: [' + datestats + ' ' + timestats + ']' + member.user.username + '#' + member.user.discriminator + ' (' + member.user.id + ')');

            sqlite.run('INSERT INTO servers (serid, sername, idusu, tag, fecha) VALUES (?, ?, ?, ?, ?)', [member.guild.id, member.guild.name, member.user.id, member.user.tag, datestats]);
            console.log('[HISTORIAL] - [SERVERS] - [ADD]: [' + datestats + ' ' + timestats + '] ' + member.user.username + '#' + member.user.discriminator + ' (' + member.user.id + ')');

        } else {
            sqlite.run('INSERT INTO historiales (idusu, tipo, descripcion, fecha, hora) VALUES (?, ?, ?, ?, ?)', [member.user.id, 'log', 'Ingreso a: ' + member.guild.name, datestats, timestats]);
            console.log('[HISTORIAL] - [LOG] - [INGRESO]: [' + datestats + ' ' + timestats + '] ' + member.user.username + '#' + member.user.discriminator + ' (' + member.user.id + ')');

            sqlite.run('INSERT INTO servers (serid, sername, idusu, tag, fecha) VALUES (?, ?, ?, ?, ?)', [member.guild.id, member.guild.name, member.user.id, member.user.tag, datestats]);
            console.log('[HISTORIAL] - [SERVERS] - [ADD]: [' + datestats + ' ' + timestats + '] ' + member.user.username + '#' + member.user.discriminator + ' (' + member.user.id + ')');
        }
    }).catch((e) => {
        console.error(e);
        console.log('[ERROR] - Registrado en [GuildMemberAdd]');


    });


}