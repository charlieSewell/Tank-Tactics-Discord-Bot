const result = require('dotenv').config(); //initialize dotenv
if (result.error) {
    throw result.error
  }
  
const { Client, Intents, Message } = require('discord.js'); //import discord.js
const { tokenToString } = require('typescript');
const schedule = require('node-schedule');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], partials: ['MESSAGE', 'CHANNEL', 'REACTION']}); //create new client
var emojisAlive = [
  "<:player1:934300869548200026>",
  "<:player2:934302835082936350>",
  "<:player3:934302834894209034>",
  "<:player4:934302834965483602>",
  "<:player5:934302834592206859>",
  "<:player6:934302834864848926>",
  "<:player7:934302834403446795>",
  "<:player8:934302834667692052>",
  "<:player9:934302834705436692>",
  "<:player10:934302834739019826>",
  "<:player11:934303625541451808>",
  "<:player12:934303588287655986>",
  "<:player13:934303588304420965>",
  "<:player14:934304489337397329>"
]
//TODO: MAKE DEAD EMOJIS AND POPULATE ARRAY
var emojisDead = [
  "<:player1:934300869548200026>",
  "<:player2:934302835082936350>",
  "<:player3:934302834894209034>",
  "<:player4:934302834965483602>",
  "<:player5:934302834592206859>",
  "<:player6:934302834864848926>",
  "<:player7:934302834403446795>",
  "<:player8:934302834667692052>",
  "<:player9:934302834705436692>",
  "<:player10:934302834739019826>",
  "<:player11:934303625541451808>",
  "<:player12:934303588287655986>",
  "<:player13:934303588304420965>",
  "<:player14:934304489337397329>"
]
var channel;
class Position
{
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.id = undefined;
    this.hasHeart = false;
  }
}
function randomPosition()
{
  return new Position(Math.floor(Math.random()*18), Math.floor(Math.random()* 20))
}
function addPlayer(userID,playerNumber)
{
  var pos = randomPosition()
  players.set(userID,new Player(pos.x, pos.y, userID, playerNumber-1));
}
class Player
{
  constructor(x,y,id,char) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.ap = 100;
    this.health = 3;
    this.alive = true;
    this.range = 2;
    this.id = id;
  }
}
//Turn coord system into array index
function coordToIndex(x,y)
{
  if(x >= 0 && y >= 0)
  {
    var res =  (x*20) + y;
    if(res >= 0 && res < 360)
      return res;
  }
  return undefined;
}

const players = new Map();
var map = [];

for(var x = 0; x < 18; x++)
{
  for(var y = 0; y < 20; y++)
  {
    map.push(new Position(x,y));
  }
}

var map1Message;
var map2Message;

var registrationMessage;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async msg =>
{
  if (msg.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await msg.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
    if(msg.content[0] == "!")
    {
      let tokens = msg.content.split(" ");
      if(tokens[0] == "!test")
      {

          //msg.reply(tokens[1]);
          map[coordToIndex(parseInt(tokens[1]),parseInt(tokens[2]))].char = '⬛';
          map1Message.edit(showMap1());
          map2Message.edit(showMap2());
          
      }
      if(tokens[0] == "!set")
      {
        shootMenu();
      }
      if(tokens[0] == "!setChannel")
      {
        channel = msg.channel
        channel.send(showMap1()).then(message => map1Message = message);
        channel.send(showMap2()).then(message => 
        {
          map2Message = message; 
          mainMenu();
        });
      }
      if(tokens[0] == "!setup")
      {
        addPlayer(msg.author.id,1)
      }
      if(tokens[0] == "!stats")
      {
        msg.author.send(`Stats\nHealth: ${players.get(msg.author.id).health}\nRange: ${players.get(msg.author.id).range}\nAP: ${players.get(msg.author.id).ap}`)
      }
      if(map1Message != undefined)
      {
        updateMap();
        map1Message.edit(showMap1());
        map2Message.edit(showMap2());
      }     
    }    
})
function updateMap()
{
  players.forEach(player => {
    if(map[coordToIndex(player.x,player.y)] != undefined)
    {
      map[coordToIndex(player.x,player.y)].char = player.char;
      map[coordToIndex(player.x,player.y)].id = player.id;
    }
  });
}

function showMap1()
{
  var flatmap = "";
  for(var x = 0; x < 9; x++)
  {
    for(var y = 0; y < 20; y++)
    {
      if(map[coordToIndex(x,y)] != undefined && map[coordToIndex(x,y)].id != undefined)
      {
        var player = players.get(map[coordToIndex(x,y)].id)
        if(player.x == x && player.y == y)
        {
          if(player.alive)
          {
            flatmap += emojisAlive[player.char];
          }   
          else 
          {
            flatmap += emojisDead[player.char];
          } 
        }
        else
        {
          flatmap += '⬜';
        }
      }
      else if(map[coordToIndex(x,y)] != undefined && map[coordToIndex(x,y)].hasHeart == true)
      {
        flatmap += '❤️';
      }
      else
      {
        flatmap += '⬜';
      }
    }
    flatmap += '\n';
  }
  return flatmap  
}
function showMap2()
{
  var flatmap = "";
  for(var x = 9; x < 18; x++)
  {
    for(var y = 0; y < 20; y++)
    {
      if(map[coordToIndex(x,y)] != undefined && map[coordToIndex(x,y)].id != undefined)
      {
        var player = players.get(map[coordToIndex(x,y)].id)
        if(player.x == x && player.y == y)
        {
          if(player.alive)
          {
            flatmap += emojisAlive[player.char];
          }   
          else 
          {
            flatmap += emojisDead[player.char];
          } 
        }
        else
        {
          flatmap += '⬜';
        } 
      }
      else if(map[coordToIndex(x,y)] != undefined && map[coordToIndex(x,y)].hasHeart == true)
      {
        flatmap += '❤️';
      }
      else
      {
        flatmap += '⬜';
      }
    }
    flatmap += '\n';
  }
  return flatmap  
}
function mainMenu()
{
  map2Message.reactions.removeAll();
  map2Message.react('⬅️');
  map2Message.react('⬆️');
  map2Message.react('⬇️');
  map2Message.react('➡️');
  map2Message.react('🔫');
  map2Message.react('❤️');
  map2Message.react('⏫');
}
var activeplayers = [];
function shootMenu(player)
{
  map2Message.reactions.removeAll();
  map2Message.react('❌')
  for(var x = -player.range; x <= player.range;x++)
  {
    for(var y = -player.range; y <= player.range;y++)
    {
      var worldX = player.x + x;
      var worldY = player.y + y;
      var position = map[coordToIndex(worldX,worldY)]
      if(otherPlayer != undefined)
      {
        if(position != undefined && position.id != undefined)
        {
          var otherPlayer = players.get(position.id);
          
          if(position.id != player.id && otherPlayer.alive)
          {
            map2Message.react(player.char)
            activeplayers.push(player);
          }
        }
      } 
    }
  }
}

function validateMove(user, amount)
{
  var player = players.get(user.id);
  if(player == undefined)
  {
    return false;
  }
  if(player.alive)
  {
    if(player.ap >= amount)
    {
      player.ap -= amount;
      return true;
    }
    user.send(`You dont have enough AP Balance is: ${player.ap}`);
    return false;
  }
  user.send(`Cannot Make Move. You are dead`);
  return false
}
function shoot(player, otherPlayer)
{
  otherPlayer.health -= 1;
  console.log(otherPlayer);
  if(otherPlayer.health <= 0)
  {
    otherPlayer.alive = false;
    player.ap += otherPlayer.ap;
    otherPlayer.ap = 0;
    
  }
}
function giftAP(sender, reciever)
{
  if(validateMove(sender, 1))
  {
    reciever.ap += 1;
  }
}
function giftHealth(sender, reciever)
{
  if(sender.health >= 2)
  {
    sender.health -= 1;
    if(!reciever.alive)
    {
      reciever.health = 0;
      reciever.alive = true;
    }
    reciever.health += 1;
  }
}
function checkHeart(player)
{
  if(map[coordToIndex(player.x,player.y)].hasHeart)
  {
    player.health += 1;
    map[coordToIndex(player.x,player.y)].hasHeart = false;
  }
}
function render(){
  updateMap();
  map1Message.edit(showMap1());
  map2Message.edit(showMap2());
}
var lockingPlayer = undefined;
client.on("messageReactionAdd", async (reaction, user) =>{
  if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
  if(user.id != client.user.id && reaction.message.id == map2Message.id)
  {
    var player = players.get(user.id)
    if(lockingPlayer == undefined || lockingPlayer == player.id)
    {
      if(reaction.emoji.name == "⬅️")
      {
        if(player.y > 0)
        {
          if(validateMove(user, 1))
          {
            map[coordToIndex(player.x,player.y)].id = undefined;
            player.y -= 1;
            checkHeart(player)
          }
        }
        
      }
      else if(reaction.emoji.name == "⬆️")
      {
        if(player.x > 0)
        {
          if(validateMove(user, 1))
          {
            map[coordToIndex(player.x,player.y)].id = undefined;
            player.x -= 1;
            checkHeart(player)
          }
        }
      }
      else if(reaction.emoji.name == "⬇️")
      {
        if(player.x < 17)
        {
          if(validateMove(user, 1))
          {
            map[coordToIndex(player.x,player.y)].id = undefined;
            player.x += 1;
            checkHeart(player)
          }
        }
      }
      else if(reaction.emoji.name == "➡️")
      {
        if(player.y < 19)
        {
          if(validateMove(user, 1))
          {
            map[coordToIndex(player.x,player.y)].id = undefined;
            player.y += 1;
            checkHeart(player)
          }
        }
      }
      else if(reaction.emoji.name == "🔫")
      {
        shootMenu(player)
      }
      else if(reaction.emoji.name == "❤️")
      {
        if(validateMove(user, 3))
        {
          player.health += 1;
        }
      }
      else if(reaction.emoji.name == "⏫")
      {
        if(validateMove(user, 3))
        {
          player.range += 1;
        }
      }
      else if(reaction.emoji.name == "❌")
      {
        activeplayers = [];
        lockingPlayer = undefined;
        mainMenu(player);
      }
      activeplayers.forEach(otherPlayer =>
      {
        if(otherPlayer != undefined)
        {
          if(reaction.emoji.name == otherPlayer.char)
          {
            if(validateMove(user, 1))
            {
              shoot(player, otherPlayer);
            }
              //return;
          }
        }
      });
    }
    reaction.users.remove(user);
    if(map1Message != undefined)
    {
      render();
    }
  }
})

schedule.scheduleJob('0 0 * * *', () => {
  players.forEach(player => {
    if(player.alive)
    {
      player.ap += 1;
    }
  })
}) // run everyday at midnight to add 1 ap to people

schedule.scheduleJob('0 12 * * *', () => { 
  if(map1Message != undefined)
  {
    var randPos = randomPosition();
    map[coordToIndex(randPos.x,randPos.y)].hasHeart = true;
    render();
  }
}) // run everyday at midday to add heart to board

schedule.scheduleJob('0 16 * * *', () => {
  channel.send("Daily Jury Vote \n Have your pick on who doesnt get their AP");
})
client.login(process.env.CLIENT_TOKEN); //login bot using token