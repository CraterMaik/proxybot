
const Discord = require("discord.js");
const config = require('./config.json');
const client = new Discord.Client();
const fs = require('fs');
const moment = require("moment")
require('moment-duration-format');

const sqlite = require('sqlite');
sqlite.open('./proxybd.sqlite');

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./proxybd.sqlite');

const timestamp = new Date();
const datestats = moment(timestamp).format("DD/MM/YYYY");
const timestats = moment(timestamp).format("HH:mm:ss");



client.login(config.token);

fs.readdir('./eventos/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        let eventFunction = require(`./eventos/${file}`);
        let eventName = file.split('.')[0];
        
        client.on(eventName, (...args) => eventFunction.run(client, ...args));
    });
});

client.on('guildBanAdd', (guild, user) => {
    
    sqlite.get(`SELECT * FROM users WHERE userId ="${user.id}"`).then(select => {
        if (!select) {

            sqlite.run('INSERT INTO users (userId, name) VALUES (?, ?)', [user.id, user.username + '#' + user.discriminator]);
            console.log('[NEW USERS] - [INGRESO]: ' + user.username + '#' + user.discriminator + ' (' + user.id + ')');

            sqlite.run('INSERT INTO historiales (idusu, tipo, descripcion, fecha, hora) VALUES (?, ?, ?, ?, ?)', [user.id, 'ban', 'BanAdd in: ' + guild.name, datestats, timestats]);
            console.log('[HISTORIAL] - [BAN] - [ADD]: [' + datestats + ' ' + timestats + ']' + user.username + '#' + user.discriminator + ' (' + user.id + ')');

        } else {
            sqlite.run('INSERT INTO historiales (idusu, tipo, descripcion, fecha, hora) VALUES (?, ?, ?, ?, ?)', [user.id, 'ban', 'BanAdd in: ' + guild.name, datestats, timestats]);
            console.log('[HISTORIAL] - [BAN] - [ADD]: [' + datestats + ' ' + timestats + '] ' + user.username + '#' + user.discriminator + ' (' + user.id + ')');


        }
    }).catch((e) => {
        console.error(e);
        console.log('[ERROR] - Registrado en [guildBanAdd]');

    });
});


client.on('guildBanRemove', (guild, user) => {
    
    sqlite.get(`SELECT * FROM users WHERE userId ="${user.id}"`).then(select => {
        if (!select) {

            sqlite.run('INSERT INTO users (userId, name) VALUES (?, ?)', [user.id, user.username + '#' + user.discriminator]);
            console.log('[NEW USERS] - [INGRESO]: ' + user.username + '#' + user.discriminator + ' (' + user.id + ')');

            sqlite.run('INSERT INTO historiales (idusu, tipo, descripcion, fecha, hora) VALUES (?, ?, ?, ?, ?)', [user.id, 'ban', 'BanRemove: ' + guild.name, datestats, timestats]);

            console.log('[HISTORIAL] - [BAN] - [REMOVE]: [' + datestats + ' ' + timestats + ']' + user.username + '#' + user.discriminator + ' (' + user.id + ')');

        } else {
            sqlite.run('INSERT INTO historiales (idusu, tipo, descripcion, fecha, hora) VALUES (?, ?, ?, ?, ?)', [user.id, 'ban', 'BanRemove: ' + guild.name, datestats, timestats]);
            console.log('[HISTORIAL] - [BAN] - [REMOVE]: [' + datestats + ' ' + timestats + '] ' + user.username + '#' + user.discriminator + ' (' + user.id + ')');

        }
    }).catch((e) => {
        console.error(e);
        console.log('[ERROR] - Registrado en [guildBanRemove]');


    });
});


var prx = config.prefix;
let list = new Array();

client.on("message", (message) => {
    if (!message.content.startsWith(prx)) return;

    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;

    const content = message.content.split(' ').slice(1);
    const argss = content.join(' ');

    

    if (message.content.startsWith(prx + "his")) {

        if (!argss) return message.channel.send('Modo de uso: `' + prx + 'his <log/ban/servers> IDUSER ó ' + prx + 'his <banlist> `');

        let op = argss.split(' ');

        if (op[0] === 'log') {
            if (!op[1]) return message.channel.send('`Ingrese el ID del usuario a consultar.`');

            let sql = `SELECT * FROM historiales WHERE idusu =? AND tipo ='log'`;
            console.log(op[1]);
            db.all(sql, [op[1]], (err, rows) => {
                rows.forEach(function (row) {
                    list.push(' 📆 ' + row.fecha + ' ' + row.hora + '  📊 ' + row.descripcion);

                });

                if (list.length < 1) return message.channel.send('```xl\n[❌ SIN HISTORIAL]' + '\n```');

                db.get(`SELECT * FROM users WHERE userId =?`, [op[1]], (err, rowsu) => {
                    message.channel.send('```xl\n[📑 HISTORIAL DE ' + rowsu.name + ']\n\n' + list.join('\n') + '\n```');
                })

            });
            list = new Array();

        }
        if (op[0] === 'ban') {
            if (!op[1]) return message.channel.send('`Ingrese el ID del usuario a consultar.`');

            let sql = `SELECT * FROM historiales WHERE idusu =? AND tipo ='ban'`;
            console.log(op[1]);
            db.all(sql, [op[1]], (err, rows) => {
                rows.forEach(function (row) {
                    list.push(' 📆 ' + row.fecha + ' ' + row.hora + '  📊 ' + row.descripcion);

                });

                if (list.length < 1) return message.channel.send('```xl\n[❌ SIN HISTORIAL]' + '\n```');

                db.get(`SELECT * FROM users WHERE userId =?`, [op[1]], (err, rowsu) => {
                    message.channel.send('```xl\n[📑 HISTORIAL DE ' + rowsu.name + ']\n\n' + list.join('\n') + '\n```');
                })

            });
            list = new Array();
        }
        if (op[0] === 'servers') {
            if (!op[1]) return message.channel.send('`Ingrese el ID del usuario a consultar.`');
            
            let sql = `SELECT * FROM servers WHERE idusu =?`;
            console.log(op[1]);
            db.all(sql, [op[1]], (err, rows) => {
                rows.forEach(function (row) {
                    list.push(' 📆 ' + row.fecha + '  📊 ' + row.sername);

                });

                if (list.length < 1) return message.channel.send('```xl\n[❌ SIN HISTORIAL]' + '\n```');

                db.get(`SELECT * FROM users WHERE userId =?`, [op[1]], (err, rowsu) => {
                    message.channel.send('```xl\n[📑 HISTORIAL DE ' + rowsu.name + ']\n\n' + list.join('\n') + '\n```');
                })

            });
            list = new Array();

        }
        if (op[0] === 'banslist') {


            let sql = `SELECT * FROM historiales WHERE descripcion =? AND tipo ='ban'`;
            console.log('BanAdd in: ' + message.guild.name);
            db.all(sql, ['BanAdd in: ' + message.guild.name], (err, rows) => {
                rows.forEach(function (row) {

                    list.push(' 📆FECHA: ' + row.fecha + '  📊 IDUSER: ' + row.idusu);

                });

                if (list.length < 1) return message.channel.send('```xl\n[❌ SIN HISTORIAL]' + '\n```');

                message.channel.send('```xl\n[📑 HISTORIAL]\n\n' + list.join('\n') + '\n```');

            });
            list = new Array();
        }
       
    }
    
    if (message.content.startsWith(prx + "greporte")) {
       
        if (!argss) return message.channel.send('Modo de uso: `' + prx + 'greporte razón | taguser | iduser | link imagen`\n\n' +
            '```autohotkey\n◈       razón :: Razón del reporte a generar.\n◈     taguser :: Tag del usuario a reportar, Ejm: User#2360.\n◈          id :: Id del usuario a reportar.\n◈ link imagen :: Link de la imagen (Evidencia como: spam/link de invitación/raideos/otros.).\n```');
        let text = argss.split(' | ');

        if (!text[0]) return message.channel.send('```xl\n[❌ INGRESE TODOS LOS CAMPOS PARA GENERAR UN REPORTE]' + '\n```' + '\n\nModo de uso: `' + prx + 'greporte razón | taguser | iduser | link imagen`\n\n' +
            '```autohotkey\n◈       razón :: Razón del reporte a generar.\n◈     taguser :: Tag del usuario a reportar, Ejm: User#2360.\n◈          id :: Id del usuario a reportar.\n◈ link imagen :: Link de la imagen (Evidencia como: spam/link de invitación/raideos/otros.).\n```');
        if (!text[1]) return message.channel.send('```xl\n[❌ INGRESE TODOS LOS CAMPOS PARA GENERAR UN REPORTE]' + '\n```' + '\n\nModo de uso: `' + prx + 'greporte razón | taguser | iduser | link imagen`\n\n' +
            '```autohotkey\n◈       razón :: Razón del reporte a generar.\n◈     taguser :: Tag del usuario a reportar, Ejm: User#2360.\n◈          id :: Id del usuario a reportar.\n◈ link imagen :: Link de la imagen (Evidencia como: spam/link de invitación/raideos/otros.).\n```');
        if (!text[2]) return message.channel.send('```xl\n[❌ INGRESE TODOS LOS CAMPOS PARA GENERAR UN REPORTE]' + '\n```' + '\n\nModo de uso: `' + prx + 'greporte razón | taguser | iduser | link imagen`\n\n' +
            '```autohotkey\n◈       razón :: Razón del reporte a generar.\n◈     taguser :: Tag del usuario a reportar, Ejm: User#2360.\n◈          id :: Id del usuario a reportar.\n◈ link imagen :: Link de la imagen (Evidencia como: spam/link de invitación/raideos/otros.).\n```');
        if (!text[3]) return message.channel.send('```xl\n[❌ INGRESE TODOS LOS CAMPOS PARA GENERAR UN REPORTE]' + '\n```' + '\n\nModo de uso: `' + prx + 'greporte razón | taguser | iduser | link imagen`\n\n' +
            '```autohotkey\n◈       razón :: Razón del reporte a generar.\n◈     taguser :: Tag del usuario a reportar, Ejm: User#2360.\n◈          id :: Id del usuario a reportar.\n◈ link imagen :: Link de la imagen (Evidencia como: spam/link de invitación/raideos/otros.).\n```');

        
        sqlite.run('INSERT INTO reportes (razon, img, usernom, userid, xuserop, estado, fecha, hora) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [text[0], text[3], text[1], text[2], message.author.username + '#' + message.author.discriminator, 'En proceso', datestats, timestats]);
        
        let canal = client.channels.get(config.idcanalreportes);

        sqlite.each("SELECT MAX(idrep) as idrp FROM reportes", function (err, row) {

            canal.send('Nuevo reporte en generado : ID Reporte: **' + row.idrp + '**\nPor: **' + message.author.username + ' (' + message.author.id + ')**.\nUse: `!!ydreporte ID` para el proceso de verificación.');
            console.log('[NEW REPORT] ' + datestats + ' ' + timestats);
            message.channel.send(':arrows_counterclockwise: generando..').then(m => {
                m.edit('Su reporte fue generado correctamente, revise sus mensajes directos.')
            });

            message.author.send('```xl\nHola ' + message.author.username + '#' + message.author.discriminator + ',\nSu reporte se ha generado correctamente.\n\n\n' +
                '[DETALLES]\n\nID Reporte:' + row.idrp + '\nUsuario reportado: ' + text[1] + '\nID: ' + text[2] + '\nEstado: En proceso ' + '\nRazón: ' + text[0] + '\nFecha:' + datestats + ' ' + timestats + '\n\n\n' +
                '[VERIFICACION]\n\nSu reporte esta EN PROCESO de verificación, si su reporte es valido pasará a estado ACEPTADO y será almacenado en la Base de Datos del sistema. De lo contrario pasará a estado RECHAZADO y no tendrá validez.\n\n```\n' +
                'Para mas detalles del proceso de verificación ingrese a nuestro servidor: https://discord.gg/zvQSd9A');
            
        });

    }

    if (message.content.startsWith(prx + "lreporte")) {
        //let perms = message.member.hasPermission("ADMINISTRATOR");
        //if(!perms) return message.channel.send("No tienes permisos de `ADMINISTRADOR` para usar la funciones del bot.");

        if (!argss) return message.channel.send('Modo de uso: `' + prx + 'lreporte IDUSER`');

        let sql = `SELECT * FROM reportes WHERE userid=?`;

        db.all(sql, [argss], (err, rows) => {
            rows.forEach(function (row) {
                list.push('◈ ' + row.idrep + '     📆 ' + row.fecha + '       🚦 ' + row.estado);

            });

            if (list.length < 1) return message.channel.send('```xl\n[❌ SIN HISTORIAL]' + '\n```');

            db.get(`SELECT * FROM users WHERE userId =?`, [argss], (err, rowsu) => {
              
                message.channel.send('```xl\n|   ID   |       FECHA       |     ESTADO    |\n\n' + list.join('\n') + '\n```');
            })

        });
        list = new Array();
    }
    if (message.content.startsWith(prx + "dreporte")) {
        //let perms = message.member.hasPermission("ADMINISTRATOR");
        //if(!perms) return message.channel.send("Nesecitas tener permisos de `ADMINISTRADOR`.");

        if (!argss) return message.channel.send('Modo de uso: `' + prx + 'dreporte IDREPORTE`');

        let sql = `SELECT * FROM reportes WHERE idrep=?`;

        db.all(sql, [argss], (err, rows) => {
            rows.forEach(function (row) {
                list.push('IDREPORTE: ' + row.idrep + '\nUSER: ' + row.usernom + '\nIDUSER: ' + row.userid + '\nFECHA: ' + row.fecha + ' ' + row.hora + '\nESTADO: ' + row.estado + '\nREPORTADO POR: ' + row.xuserop + '\nRAZON: ' + row.razon + '\nIMAGEN: ' + row.img);
            });

            if (list.length < 1) return message.channel.send('```xl\n[❌ SIN HISTORIAL]' + '\n```');

            db.get(`SELECT * FROM users WHERE userId =?`, [argss], (err, rowsu) => {
               
                message.channel.send('```xl\n[📑 RESUMEN DE REPORTE]\n\n' + list + '\n```');
            })

        });
        list = new Array();
    }

    if (message.content.startsWith(prx + "help")) {

        fs.readFile('./help.txt', (err, txt) => {
            message.channel.send('```asciidoc\n' + txt + '\n```');
        });

    }
    if (message.content.startsWith(prx + "soporte")) {

        const embed = new Discord.RichEmbed()
            .setColor(0x1a53ff)
            .setDescription('Servidor soporte: [Link de invitación](https://discord.gg/iiiiii)')
        message.channel.send({ embed });

    }
    if (message.content.startsWith(prx + "invite")) {

        const embed = new Discord.RichEmbed()
            .setColor(0x1a53ff)
            .setDescription('Link de invitación: [Bot](https://discordapp.com/oauth2/authorize?client_id='+config.idbot+'&scope=bot&permissions=1275144385)')
        message.channel.send({ embed });

    }

//VERIFICACION DE ACEPTAR Y/O RECHAZAR UN REPORTE

    let permiso = config.rolname;
    if (message.content.startsWith(prx + "rep")) {

        let op = argss.split(' ');

        let role = message.member.roles.find('name', permiso);
        if (!role) return message.channel.send('Sin permisos.');

        if (!op[0]) return message.channel.send('Modo de uso: `'+ prx +'rep aceptar/rechazar <IDREPORTE>`');

        if (op[0] === 'aceptar') {
           
            if (!role) return console.log('Sin permisos.');
            if (!op[1]) return message.channel.send('Modo de uso: `'+ prx +'rep aceptar/rechazar <IDREPORTE>`');
            sqlite.get(`UPDATE reportes SET estado = 'Aceptado' WHERE idrep=${op[1]}`);
            db.get(`SELECT * FROM reportes WHERE idrep =?`, [op[1]], (err, rows) => {
                console.log("rep id : " + rows.idrep);
                const embed = new Discord.RichEmbed()
                    .setAuthor('Reportado por: ' + rows.xuserop)
                    .setThumbnail('https://cdn.discordapp.com/emojis/289803798871015424.png?width=80&height=80')
                    .setDescription('▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ ACEPTADO')
                    .setColor(0x1a53ff)
                    .addField('Usuario reportado', rows.usernom, true)
                    .addField('ID', rows.userid, true)
                    .addField('Razón', rows.razon)
                    .addField('Imagen', '[Imagen link](' + rows.img + ')')
                    .setFooter('ID reporte: ' + rows.idrep)
                let canal = client.channels.get(config.idcanalverificados);
                canal.send({ embed })
                //message.channel.send('');  
                message.channel.send(`Reporte con el **ID: ${op[1]}** ha sido aceptado.`);
            })

        } else if (op[0] === 'rechazar') {
            console.log(op[0] + '//' + op[1])
            if (!role) return console.log('Sin permisos.');;
            if (!op[1]) return message.channel.send('Modo de uso: `' + prx + 'rep aceptar/rechazar <IDREPORTE>`');
            sqlite.get(`UPDATE reportes SET estado = 'Rechazado' WHERE idrep=${op[1]}`);
            db.get(`SELECT * FROM reportes WHERE idrep =?`, [op[1]], (err, rows) => {
                console.log("rep id : " + rows.idrep);
                const embed = new Discord.RichEmbed()
                    .setAuthor('Reportado por: ' + rows.xuserop)
                    .setThumbnail('https://cdn.discordapp.com/emojis/289803848099299329.png?width=80&height=80')
                    .setDescription('▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ RECHAZADO')
                    .setColor(0x1a53ff)
                    .addField('Usuario reportado', rows.usernom, true)
                    .addField('ID', rows.userid, true)
                    .addField('Razón', rows.razon)
                    .addField('Imagen', '[Imagen link](' + rows.img + ')')
                    .setFooter('ID reporte: ' + rows.idrep)
                let canal = client.channels.get(config.idcanalverificados);
                canal.send({ embed })
               
                message.channel.send(`Reporte con el **ID: ${op[1]}** ha sido rechazado.`);
            })

        } else {
            return;

        }
    }
   
})
