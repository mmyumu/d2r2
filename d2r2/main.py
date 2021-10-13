import os
from bs4 import BeautifulSoup
import requests
import discord
import logging
import pathlib

# create logger
logger = logging.getLogger('d2r2')
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

def get_expression():
    response = requests.get("http://nioutaik.fr/Expressionotron/index.php")
    html = response.content.decode('iso-8859-1')
    soup = BeautifulSoup(html, 'html.parser')
    return soup.find('strong').text, soup.find('img')['src']

client = discord.Client()

@client.event
async def on_ready():
    logger.info(f"I'm ready (as {client.user})")

@client.event
async def on_message(message):
    logger.debug(f"Message author {message.author} vs bot user {client.user}")
    if message.author == client.user:
        return

    logger.debug(f"Get mentions...{message.mentions}")
    # await message.channel.send(message.mentions)
    for user in message.mentions:
        logger.debug(f"User mentioned {user} vs bot user {client.user}")
        if user == client.user:
            exp, img = get_expression()
            logger.debug("I am tagged!")
            await message.channel.send(exp)
            break

with open(f"{pathlib.Path(__file__).parent.resolve()}/TOKEN") as f:
    
    token = f.readline()
    client.run(token)


def main():
    print("mytestmain")