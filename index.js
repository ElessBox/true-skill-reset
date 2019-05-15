const path = require('path');
const fs = require('fs');

module.exports = function SkillResets(mod) {
	let config, settingsPath,		
		lastSkill= 0;		
	  
	mod.game.on('enter_game', () => {
		try {
			settingsPath = `./${mod.game.me.name}-${mod.game.serverId}.json`;
			getConfigData(settingsPath);			
		} catch (e) {
			console.log(e);
		}
	});	
	//let skillTimer = [];
	
	mod.hook('S_START_COOLTIME_SKILL', 3, ({skill, cooldown}) => {
		//console.log(`SkillReset(${mod.game.me.name})|${skill.id}|${cooldown}`);
		lastSkill = skill.id;
		if(config.skill.indexOf(skill.id) != -1) {			
			setTimeout( () => {
				if(config.padding == 0) {
					showMessage(`<img src="img://skill__0__${mod.game.me.templateId}__${skill.id}" width="48" height="48" vspace="${config.vspace}"/><font size="${config.fontsize}" color="${config.resetfontcolor}">&nbsp;Reset</font>`)
				} else {
					showMessage(`<img src="img://skill__0__${mod.game.me.templateId}__${skill.id}" height="${config.padding}" width="1" /><img src="img://skill__0__${mod.game.me.templateId}__${skill.id}" width="48" height="48" vspace="${config.vspace}" /><font size="${config.fontsize}" color="${config.resetfontcolor}">&nbsp;Reset</font>`)
				}
				
			}, cooldown);
		}
	})
	
    mod.hook('S_CREST_MESSAGE', 2, ({type, skill}) => {
        if (type === 6) {
			if(config.skill.indexOf(skill.id) != -1) {			
				if(config.padding == 0) {					
					showMessage(`<img src="img://skill__0__${mod.game.me.templateId}__${skill}" width="48" height="48" vspace="${config.vspace}"/><font size="${config.fontsize}" color="${config.resetfontcolor}">&nbsp;Reset</font>`)
				} else {
					showMessage(`<img src="img://skill__0__${mod.game.me.templateId}__${skill}" height="${config.padding}" width="1" /><img src="img://skill__0__${mod.game.me.templateId}__${skill}" width="48" height="48" vspace="${config.vspace}" /><font size="${config.fontsize}" color="${config.resetfontcolor}">&nbsp;Reset</font>`)
				}
				if (!config.showsystemresetmessage) return false			
			}
        }
    })
	
	const showMessage = message => {
		mod.toClient('S_DUNGEON_EVENT_MESSAGE', 2, {
		  message,
		  type: config.flashingnotification ? 70 : 2,
		  chat: false,
		  channel: 0
		})
	  }
	
	//Gestion des commandes
	mod.command.add('skreset', (key, arg, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) => {
		switch (key) {
			case 'add':			
				if(lastSkill != 0) {
					if(config.skill.indexOf(lastSkill) == -1) {
						config.skill.push(lastSkill)
						mod.command.message('Skill '+lastSkill+' Ajouté');
					}
				} else {
					mod.command.message('Lancer un skill avant de faire la commande');
				}
				break;
			case 'remove':
				if(lastSkill != 0) {
					var index = config.skill.indexOf(lastSkill);	
					if (index != -1) {
						config.skill.splice(index, 1);
						mod.command.message('Skill '+lastSkill+' Supprimé');
					} else {
						mod.command.message('Pas dans la liste');
					}						
				} else {
					mod.command.message('Lancer un skill avant de faire la commande');
				}
				break;				
			case 'reset':
				config.skill = [];
				mod.command.message('Skills reset');
				break;	
			case 'save':				
				saveConfig(settingsPath, config);
				mod.command.message('Configuration enregistré');
				break;
			case 'reload':
				getConfigData(settingsPath);
				mod.command.message('Configuration rechargé');
				break;
			case 'test':
				showMessage(`<img src="img://skill__0__${mod.game.me.templateId}__${arg}" ${arg2} ${arg3} ${arg4} ${arg5} ${arg6} /><img src="img://skill__0__${mod.game.me.templateId}__${arg}" ${arg7} ${arg8} ${arg9} ${arg10} ${arg11}  /><font size="${config.fontsize}" color="${config.resetfontcolor}">&nbsp;Reset</font>`);
				console.log(`<img src="img://skill__0__${mod.game.me.templateId}__${arg}" ${arg2} ${arg3} ${arg4} ${arg5} /><img src="img://skill__0__${mod.game.me.templateId}__${arg}" ${arg7} ${arg8} ${arg9} ${arg10} ${arg11}  /><font size="${config.fontsize}" color="${config.resetfontcolor}">&nbsp;Reset</font>`);
				break;
			
		}
	});
	
	function getConfigData(pathToFile) {
		try {
			config = JSON.parse(fs.readFileSync(path.join(__dirname, pathToFile)));
		} catch (e) {
			config = {};
		}
		checkConfig();
	}
	
	function saveConfig(pathToFile, data) {
		fs.writeFile(path.join(__dirname, pathToFile), JSON.stringify(data, null, '\t'), err => {});
	}
	
	function checkConfig() {		
		if (config.showsystemresetmessage === undefined) {
			config.showsystemresetmessage = false;
		}
		if (config.resetfontcolor === undefined) {
			config.resetfontcolor = '#FF4500';
		}
		if (config.flashingnotification === undefined) {
			config.flashingnotification = false;
		}
		if (config.fontsize === undefined) {
			config.fontsize = 24;
		}
		if (config.vspace === undefined) {
			config.vspace = -20;
		}
		if (config.padding === undefined) {
			config.padding = 0;
		}
		if (config.skill === undefined) {
			config.skill = [];
		}
	}
}
