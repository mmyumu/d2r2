import requests
from bs4 import BeautifulSoup

from d2r2.bot_module import BotModule


class Expressionotron(BotModule):
    # def __init__(self, client: discord.Client) -> None:
    #     super(Expressionotron, self).__init__(client)

    def _init_callbacks(self):
        @self._client.event
        async def on_ready():
            self._logger.info(f"Ready (as {self._client.user})")

        @self._client.event
        async def on_message(message):
            if message.author == self._client.user:
                return

            for user in message.mentions:
                if user == self._client.user:
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
