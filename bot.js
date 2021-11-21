require('dotenv').config();
const {Telegraf} = require('telegraf');
const {word} = require("./string");

const bot = new Telegraf(process.env.TOKEN);
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;

bot.catch((err, ctx) => {
    console.log(`Error on ${ctx.updateType}`, err);
    process.exit(1);
})

bot.use(async (ctx, next) => {
    console.time(`Processing update ${ctx.update.update_id}`)
    await next() // runs next middleware
    // runs after next middleware finishes
    console.timeEnd(`Processing update ${ctx.update.update_id}`)
})

bot.start((ctx) => {
    let fullname = ctx.from.last_name ? `${ctx.from.first_name} ${ctx.from.last_name}`: `${ctx.from.first_name}`;
    let introMessage = `<b>${word.hello} ${fullname}.</b>\n\n${word.intro}`;
    let nometaMessage = word.nometa;
    ctx.replyWithHTML(introMessage);
    ctx.replyWithHTML(nometaMessage);
});

bot.help((ctx) => {
    console.log(ctx);
});

bot.command(['picture', 'image', 'img', 'pic'], (ctx) => {
    /*ctx.replyWithPhoto({
        url: 'https://picsum.photos/1080/1920/?random',
        filename: 'kitten.jpg',
        action: 'typing'
    })*/
    ctx.replyWithDocument({
        url: 'https://picsum.photos/1080/1920/?random',
        filename: 'kitten.jpg',
        action: 'typing'
    })
})
bot.command('id', (ctx) => {
    ctx.reply(ctx.from.id + " your ID");
})

bot.hears('uzsoftic', (ctx) => {
    ctx.reply("UzSoftic is Admin");
})

bot.on('message', (ctx) => {

    let userID = ctx.from.id;
    let isAdmin = (userID == ADMIN_TELEGRAM_ID) ? true : false;

    if (isAdmin) {
        // sending to specific message to user by admin
        if (ctx.update.message.reply_to_message != undefined && ctx.update.message.reply_to_message.text != undefined) {
            let senderMessage = ctx.update.message.reply_to_message.text;
            let senderID = senderMessage.split(':').shift();
            let adminMessage = ctx.update.message.text;
            ctx.telegram.sendMessage(senderID, adminMessage);
        } else {
            ctx.reply(word.forgetToReply);
        }
    }
    else {
        console.log(ctx.message);
        let senderID = ctx.message.chat.id;
        let fullname = ctx.from.last_name ? `${ctx.from.first_name} ${ctx.from.last_name}`: `${ctx.from.first_name}`;
        if (ctx.message.text != undefined) {
            let message = `${senderID}: [${fullname}](tg://user?id=${senderID})\n\n${ctx.message.text}`;
            ctx.telegram.sendMessage(ADMIN_TELEGRAM_ID, message, { parse_mode: "MarkdownV2" });
        } else {
            ctx.telegram.forwardMessage(ADMIN_TELEGRAM_ID, userID, ctx.message.message_id);
        }
    };

})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

/* TELEGRAPH: https://telegraf.js.org/ */
