"""
Run D2R2 discord bot
"""
import pathlib
# from discord.ext import commands

from d2r2.bot import Bot
from d2r2.expressionotron.bot import Expressionotron
from d2r2.kaamelott.bot import Kaamelott


# client = discord.Client()
# discord_bot = commands.Bot(".")

bot = Bot()
bot.add_module(Expressionotron())
bot.add_module(Kaamelott())

with open(f"{pathlib.Path(__file__).parent.resolve()}/TOKEN", encoding="UTF-8") as f:
    token = f.readline()
    bot.run(token)
