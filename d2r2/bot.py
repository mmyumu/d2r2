"""
Module containing common stuff for bot modules
"""
import logging
from typing import List

import discord
from discord.ext import commands


class BotModule():
    """
    Abstract class to be implemented by bot modules
    """

    def __init__(self) -> None:
        self._logger = create_logger(
            f"d2r2-bot_module-{self.__class__.__name__}")
        self._bot = None

        self._logger.info("Module %s initialized", self.__class__.__name__)

    async def on_message(self, message: discord.Message) -> None:
        """
        Triggered when a message is received
        """

    def set_bot(self, bot: commands.Bot) -> None:
        """
        Set the discord Bot
        """
        self._bot = bot


class Bot:
    """
    Bot main class
    """

    def __init__(self) -> None:
        super(Bot, self).__init__()
        self._bot = commands.Bot(command_prefix="beep ")
        self._logger = create_logger("d2r2-bot")

        self._logger.info("Bot initialized")

        self._modules: List[BotModule] = []

        self._init_callbacks()
        self._logger.info("Callbacks of bot initialized")

    def _init_callbacks(self) -> None:
        @self._bot.event
        async def on_ready():
            self._logger.info("Ready (as %s)", self._bot.user)

        @self._bot.event
        async def on_message(message) -> None:
            for module in self._modules:
                await module.on_message(message)

    def add_module(self, module: BotModule) -> None:
        """
        Add a bot module to the Bot
        """
        module.set_bot(self._bot)
        self._modules.append(module)

    def run(self, token: str):
        """
        Run the discord bot with given token
        """
        self._bot.run(token)


def create_logger(logger_name: str) -> logging.Logger:
    """
    Create/configure logger from given logger name
    """
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.DEBUG)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger
