"""
Kaamelott is a bot module playing Kaamelott quotes
"""
from discord.message import Message
from d2r2.bot import BotModule


class Kaamelott(BotModule):
    """
    Bot playing Kaamelott quotes
    """
    async def on_message(self, message: Message) -> None:
        if message.author == self._client.user:
            return

        for user in message.mentions:
            if user == self._client.user and "kaamelot" in message.content.lower():
                self._logger.debug("Mentioned in message")
                await message.channel.send("kaamelott")
                break
