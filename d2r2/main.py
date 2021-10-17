"""
Run D2R2 discord bot
"""
import pathlib
import discord

from d2r2.bot import Bot
from d2r2.expressionotron import Expressionotron
from d2r2.kaamelott import Kaamelott


client = discord.Client()

bot = Bot(client)
bot.add_module(Expressionotron())

with open(f"{pathlib.Path(__file__).parent.resolve()}/TOKEN", encoding="UTF-8") as f:
    token = f.readline()
    client.run(token)
