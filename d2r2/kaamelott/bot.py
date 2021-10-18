"""
Kaamelott is a bot module playing Kaamelott quotes
"""
import os
import pathlib
import discord
from discord.message import Message
from d2r2.bot import BotModule


class Kaamelott(BotModule):
    """
    Bot playing Kaamelott quotes
    """
    async def on_message(self, message: Message) -> None:
        if message.author == self._bot.user:
            return

        for user in message.mentions:
            if user == self._bot.user and "kaamelott" in message.content.lower():
                self._logger.debug("Mentioned in message")
                await message.channel.send("kaamelott")
                voice = await self._connect_voice_channel(message)

                if voice:
                    self._play_mp3(voice)
                break

    async def _connect_voice_channel(self, message: discord.Message) -> discord.VoiceChannel:
        ctx = await self._bot.get_context(message)
        bot_voice = discord.utils.get(self._bot.voice_clients, guild=ctx.guild)
        user_voice = message.author.voice

        if user_voice is None:
            return None

        voice = None
        if bot_voice:
            if bot_voice.channel != user_voice.channel:
                await bot_voice.disconnect()
            else:
                voice = bot_voice
        if not voice:
            voice = await user_voice.channel.connect()
        return voice


    def _play_mp3(self, voice: discord.VoiceChannel) -> None:
        res = os.getenv("KAAMELOTT_RESOURCES", str(pathlib.Path(
            __file__).parent.resolve()))
        voice.play(discord.FFmpegPCMAudio(f"{res}/vous_etes_completement_con.mp3"))
