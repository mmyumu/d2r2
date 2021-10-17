"""
Expressionotrong is a bot module generating cool expressions
"""
import requests
from bs4 import BeautifulSoup

from d2r2.bot import BotModule


class Expressionotron(BotModule):
    """
    Bot module generating expressions
    """
    async def on_message(self, message):
        if message.author == self._client.user:
            return

        for user in message.mentions:
            if user == self._client.user and "omg" in message.content.lower():
                exp, _ = self._get_expression()
                self._logger.debug("Mentioned in message")
                await message.channel.send(exp)
                break

    @staticmethod
    def _get_expression():
        response = requests.get("http://nioutaik.fr/Expressionotron/index.php")
        html = response.content.decode('iso-8859-1')
        soup = BeautifulSoup(html, 'html.parser')
        return soup.find('strong').text, soup.find('img')['src']
