const { Client, ButtonStyle, ButtonBuilder, GatewayIntentBits, Routes, Collection, ActivityType, EmbedBuilder, Events, Partials, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const config = require("./config");
const fs = require("node:fs");
const path = require("node:path");
const { REST } = require("@discordjs/rest");
const INTENTS = Object.values(GatewayIntentBits);
const db = require("croxydb");

const client = new Client({ intents: INTENTS });
client.commands = new Collection();
const slashCommands = [];

client.on("guildCreate", async (guild) => {
    console.log(`${client.user.tag} sunucuya eklendi: ${guild.name} (${guild.id})`);

    const rest = new REST({ version: '9' }).setToken(config.token);

    try {
        await rest.put(Routes.applicationGuildCommands(config.clientID, guild.id), { body: slashCommands });
        console.log(`Başarıyla komutlar yüklendi - Sunucu: ${guild.name} (${guild.id})`);
    } catch (error) {
        console.error('Komut yüklenirken bir hata oluştu:', error);
    }
});
client.once("ready", async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı.`);
	client.user.setStatus("dnd");


    const rest = new REST({ version: '9' }).setToken(config.token);

    try {
        const guilds = await client.guilds.fetch();
        const guildIDs = guilds.map(guild => guild.id);	

        for (const guildID of guildIDs) {
            await rest.put(Routes.applicationGuildCommands(config.clientID, guildID), { body: slashCommands });
            console.log(`Başarıyla komutlar yüklendi - Sunucu ID: ${guildID}`);
        }

        console.log(`Toplam ${guildIDs.length} sunucuda komutlar yüklendi.`);
    } catch (error) {
        console.error('Komut yüklenirken bir hata oluştu:', error);
	}
});

client.on("ready", async () => {
    client.user.setActivity("Sunucuyu", { type: ActivityType.Watching });
    console.log("Durum güncellendi.");
});

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());

    console.log(`${command.data.name} dosyası yüklendi.`)
}

client.on(`interactionCreate`, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`Komut ${interaction.commandName} bulunamadı.`);
		return;
	}

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error("Bir hata oluştu: " + error);
        await interaction.reply({ content: 'Bu komut çalıştırılırken bir hata oluştu!', ephemeral: true });
	}
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isButton()) return;
	if (interaction.customId === 'basvurIntereaction') {
		const modal = new ModalBuilder()
		.setCustomId('basvurModal')
		.setTitle("Başvur");
		const adSoyasInput = new TextInputBuilder()
			.setCustomId('BasvurInput')
			.setLabel("Gerçek Adın/Soyadın")
			.setStyle(TextInputStyle.Short);
		const YasInput = new TextInputBuilder()
			.setCustomId('BasvurInput2')
			.setLabel("Yaşın")
			.setStyle(TextInputStyle.Short);
		const Neden = new TextInputBuilder()
			.setCustomId('BasvurInput3')
			.setLabel("Neden başvurdun?")
			.setStyle(TextInputStyle.Short);
		const Ney = new TextInputBuilder()
			.setCustomId('BasvurInput4')
			.setLabel("Ney istiyorsun?")
			.setStyle(TextInputStyle.Short);
		const Tecrübe = new TextInputBuilder()
			.setCustomId('BasvurInput5')
			.setLabel("Kaç saat aktifsin?")
			.setStyle(TextInputStyle.Short);
		const firstActionRow = new ActionRowBuilder().addComponents(adSoyasInput);
		const firstActionRow2 = new ActionRowBuilder().addComponents(YasInput);
		const firstActionRow3 = new ActionRowBuilder().addComponents(Neden);
		const firstActionRow4 = new ActionRowBuilder().addComponents(Ney);
		const firstActionRow5 = new ActionRowBuilder().addComponents(Tecrübe);
		modal.addComponents(firstActionRow, firstActionRow2, firstActionRow3, firstActionRow4, firstActionRow5);
		await interaction.showModal(modal);
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.customId === 'basvurModal') {
		const adsoyad = interaction.fields.getTextInputValue('BasvurInput');
		const yas = interaction.fields.getTextInputValue('BasvurInput2');
		const neden = interaction.fields.getTextInputValue('BasvurInput3');
		const ney = interaction.fields.getTextInputValue('BasvurInput4');
		const tecrübe = interaction.fields.getTextInputValue('BasvurInput5');

		const kanalId = interaction.guild.channels.cache.get(config.basvurulog)
		const gonderi = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Biri Başvuru Yaptı!")
			.addFields(
                { name: 'Başvuran', value: `${interaction.user.toString()}`, inline: true},
                { name: 'Adı/Soyadı', value: `${adsoyad}`, inline: true},
                { name: '\u200B', value: '\u200B', inline: true},
                { name: 'Yaşı', value: `${yas}`, inline: true},
                { name: 'Başvuru Sebebi', value: `${neden}`, inline: true },
                { name: 'İsteği', value: `${ney}`, inline: true },
				{ name: 'Tecrübesi', value: `${tecrübe}`, inline: true },
            )
			.setFooter({ text: 'Umut Başvuru' })
		const zatenekli = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Başvuru Gönderildi!")
			.setDescription(`Başarıyla başvurdunuz!`)
			.setFooter({ text: 'Umut Başvuru' })

		const add2 = new ButtonBuilder()
			.setCustomId('yetkiIntereaction1')
			.setLabel("Yetki 1'i ver.")
			.setStyle(ButtonStyle.Danger);
		const add3 = new ButtonBuilder()
			.setCustomId('yetkiIntereaction12')
			.setLabel("Yetki 2'i ver.")
			.setStyle(ButtonStyle.Danger);
	
		const bRow = new ActionRowBuilder()
			.addComponents(add2, add3);
		await kanalId.send({ embeds: [gonderi], components: [bRow] })
			.then(msg => {
				db.set("basvuru" + msg.id, interaction.user.id)
			})
		interaction.reply({ embeds: [zatenekli], ephemeral: true })
	}
	if (interaction.customId === "yetkiIntereaction1") {
		const yetki2config = config.yetki1
		const yetki2 = interaction.guild.roles.cache.get(yetki2config)
		const findUserId = db.fetch("basvuru" + interaction.message.id)
		const findUser = interaction.guild.members.cache.get(findUserId)
		const zatenekli7 = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Başarılı!")
			.setDescription(`Başarıyla yetki 1 verildi!`)
			.setFooter({ text: 'Umut Başvuru' })
		findUser.roles.add(yetki2)
			.then(tst => {
				interaction.reply({ embeds: [zatenekli7] })
			})
	}
	if (interaction.customId === "yetkiIntereaction12") {
		const yetki2config = config.yetki2
		const yetki2 = interaction.guild.roles.cache.get(yetki2config)
		const findUserId = db.fetch("basvuru" + interaction.message.id)
		const findUser = interaction.guild.members.cache.get(findUserId)
		const zatenekli7 = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Başarılı!")
			.setDescription(`Başarıyla yetki 2 verildi!`)
			.setFooter({ text: 'Umut Başvuru' })
		findUser.roles.add(yetki2)
			.then(tst => {
				interaction.reply({ embeds: [zatenekli7] })
			})
	}
});

client.on(Events.MessageDelete, (message) => {
	if (db.has("basvuru" + message.id)) {
		db.delete("basvuru" + message.id)
	}
})

client.login(config.token);
