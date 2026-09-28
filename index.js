const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// آيديك وآيدي صديقك (تستخدمون كل الأوامر)
const ALLOWED_USERS = ["1489281825942667355", "1476270096296050730"];

// آيديات مخصصة لأوامر معينة حسب طلبك
const PROMOTION_USER_ID = "1543460225208549416";
const CHANNEL_LOCK_USER_ID = "1551588105750847558";

// ترتيب الرتب من الأضعف للأقوى لأمر الترقية والتخفيض
const roleHierarchy = [
    '1537274972597260379', '1537274242909868085', '1537275238885359636', '1537275451209158656',
    '1537275663503855696', '1537276083907465337', '1537276300404985896', '1537276853658718229',
    '1537277669492920460', '1537278347120214138', '1537279054724595794', '1537282990672187522',
    '1537283287318274188', '1537283780497113181', '1537287444943339560', '1537287340131614791',
    '1537287147567194132', '1537287030571147264', '1537286917098573855', '1537286787746111518',
    '1537286692820619274', '1537286574994362398', '1537286410065678428', '1537286276146004090',
    '1537286158935920801', '1537286049108205728', '1537285923971010670', '153728572288795451',
    '1537285604570824815', '1537285461666431077', '1537285297220485230', '1537285183953440900',
    '1537285070883258379', '1537284815727099985', '1537284679127015504', '1537284582611882075',
    '1537468075379523654', '1537284292189626458', '1537284292189626458', '1537283268796354590',
    '1537283064965627995', '1537282925115088906', '1537282688560533654', '1537282379293663373',
    '1537282219062730752', '1537281951705211010', '1537281806586478652', '1537281536498606150',
    '1537281235951419434', '1537279895011459153', '1537280175509872640', '1537279625707782265',
    '1537279087389843467', '1537278719553568768', '1537278304338321528', '1537277782487203940',
    '1552477957635702814', '1552477706996682853', '1552478857771221053', '1552480135385452645',
    '1552480171133771796', '1552480238691426424', '1552480275370610690', '1552480327019274291',
    '1552480375421538486', '1552480389250031676'
];

module.exports = [
    // 1. أمر (ق) - قفل الروم
    {
        data: new SlashCommandBuilder().setName('ق').setDescription('قفل الروم الحالي'),
        async execute(interaction) {
            if (!ALLOWED_USERS.includes(interaction.user.id) && interaction.user.id !== CHANNEL_LOCK_USER_ID) {
                return interaction.reply({ content: '❌ عذراً، هذا الأمر ليس مخصصاً لك!', ephemeral: true });
            }
            const channel = interaction.channel;
            const everyoneRole = interaction.guild.roles.everyone;

            const currentPerm = channel.permissionsFor(everyoneRole).has(PermissionFlagsBits.SendMessages);
            if (!currentPerm) {
                return interaction.reply({ content: '___هذا الروم مقفول بالفعل___', ephemeral: true });
            }

            await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: false });
            return interaction.reply({ content: `___تم قفل الروم بواسطة ${interaction.user} بنجاح✓___` });
        }
    },

    // 2. أمر (ف) - فتح الروم
    {
        data: new SlashCommandBuilder().setName('ف').setDescription('فتح الروم الحالي'),
        async execute(interaction) {
            if (!ALLOWED_USERS.includes(interaction.user.id) && interaction.user.id !== CHANNEL_LOCK_USER_ID) {
                return interaction.reply({ content: '❌ عذراً، هذا الأمر ليس مخصصاً لك!', ephemeral: true });
            }
            const channel = interaction.channel;
            const everyoneRole = interaction.guild.roles.everyone;

            const currentPerm = channel.permissionsFor(everyoneRole).has(PermissionFlagsBits.SendMessages);
            if (currentPerm) {
                return interaction.reply({ content: '___هذا الروم مفتوح بالفعل___', ephemeral: true });
            }

            await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: null });
            return interaction.reply({ content: `___تم فتح الروم بواسطة ${interaction.user} بنجاح✓___` });
        }
    },

    // 3. أمر (تف) - بان
    {
        data: new SlashCommandBuilder()
            .setName('تف')
            .setDescription('حظر شخص من السيرفر')
            .addUserOption(option => option.setName('user').setDescription('العضو المراد حظره').setRequired(true)),
        async execute(interaction) {
            if (!ALLOWED_USERS.includes(interaction.user.id)) {
                return interaction.reply({ content: '❌ هذا الأمر مخصص لك ولصديقك فقط!', ephemeral: true });
            }
            const user = interaction.options.getUser('user');
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            if (!member) {
                return interaction.reply({ content: '❌ هذا العضو غير موجود في السيرفر!', ephemeral: true });
            }

            await member.ban({ reason: `بواسطة ${interaction.user.tag}` });
            return interaction.reply({ content: `___ختفووووووووووووووو ${user}___` });
        }
    },

    // 4. أمر (ترقيه)
    {
        data: new SlashCommandBuilder()
            .setName('ترقيه')
            .setDescription('ترقية إداري لرتبة أعلى')
            .addUserOption(option => option.setName('user').setDescription('العضو الإداري').setRequired(true))
            .addIntegerOption(option => option.setName('steps').setDescription('عدد خطوات الترقية').setRequired(true)),
        async execute(interaction) {
            if (!ALLOWED_USERS.includes(interaction.user.id) && interaction.user.id !== PROMOTION_USER_ID) {
                return interaction.reply({ content: '❌ عذراً، أمر الترقية غير متاح لك!', ephemeral: true });
            }
            const user = interaction.options.getUser('user');
            const steps = interaction.options.getInteger('steps');
            const member = await interaction.guild.members.fetch(user.id);

            let currentIndex = -1;
            let currentRoleId = null;
            for (let i = 0; i < roleHierarchy.length; i++) {
                if (member.roles.cache.has(roleHierarchy[i])) {
                    currentIndex = i;
                    currentRoleId = roleHierarchy[i];
                    break;
                }
            }

            if (currentIndex === -1) {
                return interaction.reply({ content: '❌ هذا الشخص ليس لديه أي رتبة إدارية مسجلة في القائمة!', ephemeral: true });
            }

            const newIndex = Math.min(currentIndex + steps, roleHierarchy.length - 1);
            const newRoleId = roleHierarchy[newIndex];

            const oldRole = interaction.guild.roles.cache.get(currentRoleId);
            const newRole = interaction.guild.roles.cache.get(newRoleId);

            await member.roles.remove(oldRole);
            await member.roles.add(newRole);

            return interaction.reply({
                content: `___تمت ترقية الاداري ${user}\n\nمن رتبة ${oldRole}\n\nالى رتبة ${newRole}\n\nبنجاح✓___`
            });
        }
    },

    // 5. أمر (تخفيض)
    {
        data: new SlashCommandBuilder()
            .setName('تخفيض')
            .setDescription('تخفيض إداري لرتبة أقل')
            .addUserOption(option => option.setName('user').setDescription('العضو الإداري').setRequired(true))
            .addIntegerOption(option => option.setName('steps').setDescription('عدد خطوات التخفيض').setRequired(true)),
        async execute(interaction) {
            if (!ALLOWED_USERS.includes(interaction.user.id) && interaction.user.id !== PROMOTION_USER_ID) {
                return interaction.reply({ content: '❌ عذراً، أمر التخفيض غير متاح لك!', ephemeral: true });
            }
            const user = interaction.options.getUser('user');
            const steps = interaction.options.getInteger('steps');
            const member = await interaction.guild.members.fetch(user.id);

            let currentIndex = -1;
            let currentRoleId = null;
            for (let i = 0; i < roleHierarchy.length; i++) {
                if (member.roles.cache.has(roleHierarchy[i])) {
                    currentIndex = i;
                    currentRoleId = roleHierarchy[i];
                    break;
                }
            }

            if (currentIndex === -1) {
                return interaction.reply({ content: '❌ هذا الشخص ليس لديه أي رتبة إدارية مسجلة في القائمة!', ephemeral: true });
            }

            const newIndex = Math.max(currentIndex - steps, 0);
            const newRoleId = roleHierarchy[newIndex];

            const oldRole = interaction.guild.roles.cache.get(currentRoleId);
            const newRole = interaction.guild.roles.cache.get(newRoleId);

            await member.roles.remove(oldRole);
            await member.roles.add(newRole);

            return interaction.reply({
                content: `___تم تخفيض الاداري ${user}\n\nمن رتبة ${oldRole}\n\nالى رتبة ${newRole}\n\nبنجاح✓___`
            });
        }
    }
];
