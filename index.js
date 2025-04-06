const { VK, Keyboard, MessageContext, Context } = require('vk-io');
const { HearManager } = require('@vk-io/hear');

const vk = new VK({
    token: 'token'
});

const config = require('./config.json');

const bot = new HearManager();
vk.updates.on('message_new', bot.middleware);
const users = [];

bot.hear('Начать',  async(next, context) => {
    const user = users.filter(x => x.id === next.senderId)[0];

    if (next.is('message' && next.isOutbox || next.is('message') && next.senderType == 'group')) {
        return;
    }

    if (user) {
        return context();
    }

    const [user_info] = await vk.api.users.get({user_id: next.senderId});
    users.push({
        id: next.senderId,
        firstName: user_info.first_name,
        lastName: user_info.last_name,
    });

    return context();
});


bot.hear('Начать', async (context) => {
    const user = users.filter(x => x.id === context.senderId)[0];

    if (!user) {
        return;
    }

	await context.reply({
		message: '🐔 @id' + user.id + '(' + user.firstName + ')' + ', привет! Вероятнее всего, ты хочешь прогулять учебу и спать дома, но не можешь решиться. Мы поможем тебе в решении этой проблемы. Используй кнопки на клавиатуре диалога для использования нашего чат-бота.',
		keyboard: Keyboard.builder()
        //.inline() — делает из https://i.imgur.com/jHkOwhW.png это https://i.imgur.com/9I5slVv.png
			.textButton({
				label: '👥 Профиль',
				payload: {
					command: 'Профиль'
                },
				color: Keyboard.PRIMARY_COLOR
			})
			.textButton({
				label: '🗒 Помощь',
				payload: {
					command: 'Помощь'
				},
				color: Keyboard.POSITIVE_COLOR
			})
            .row()
			.textButton({
				label: '💤 Пропустить ли сегодня учебу?',
				payload: {
					command: 'Пропустить ли сегодня учебу'
				},
				color: Keyboard.SECONDARY_COLOR
			})
	});
});

bot.hear(/Профиль/i,  async(context, next) => {
    const user = users.filter(x => x.id === context.senderId)[0];

    if (!user) {
        return;
    }

    context.reply('👁 Профиль: @id' + user.id + '(' + user.firstName + ' ' + user.lastName + ')' + '\n\n' + '📅 Количество пропущенных дней: user.skipdays' + '\n' + '📅 Количество непропущенных дней: user.noskipdays');
});

bot.hear(/Помощь/i,  async(context, next) => {
    const user = users.filter(x => x.id === context.senderId)[0];

    if (!user) {
        return;
    }

    context.reply('🕵‍♀ Что за бот "Пропустить ли сегодня учебу?" и для чего он нужен? Бот был создан для того, чтобы ответить на вопрос, стоит ли посещать сегодня ваше учебное заведение или нет.\n\n🕵‍♂ Вы подкручиваете пропуск учебы? Нет, у нас все сделано на чистейшем рандоме. Если у вас сегодня выпал пропуск, то значит так распорядилась судьба.\n\n🤖 Для чего существует "Профиль"? Профиль создан для того, чтобы Вы могли знать, сколько дней было пропущено/не пропущено.');
});

bot.hear(/Пропустить ли сегодня учебу?/i,  async(context, next) => {
    const user = users.filter(x => x.id === context.senderId)[0];

    if (!user) {
        return;
    }

    var arr = ['пропустить учебу', 'не пропускать учебу'];
    var rand = Math.round(Math.random());

    context.reply('@id' + user.id + '(' + user.firstName + '), ' + 'сегодня мы рекомендуем тебе — ' + arr[rand] + '. Мне кажется, это пойдет тебе на пользу. 🙂');
});

console.log('Бот запущен!');
vk.updates.start().catch(console.error);