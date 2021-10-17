import pathlib
import discord

from d2r2.expressionotron import Expressionotron


client = discord.Client()

Expressionotron(client)


with open(f"{pathlib.Path(__file__).parent.resolve()}/TOKEN", encoding="UTF-8") as f:
    token = f.readline()
    client.run(token)
