"""
Module containing common stuff for bot modules
"""
import logging
from typing import List
from abc import ABC, abstractmethod

import discord


class BotModule(ABC):
    """
    Abstract class to be implemented by bot modules
    """

    def __init__(self) -> None:
        self._logger = create_logger(
            f"d2r2-bot_module-{self.__class__.__name__}")
        self._client = None

        self._logger.info("Module %s initialized", self.__class__.__name__)

    @abstractmethod
    async def on_message(self, message) -> None:
        pass

    def set_client(self, client: discord.Client) -> None:
        """
        Set the discord Client
        """
        self._client = client


class Bot:
    """
    Bot main class
    """

    def __init__(self, client: discord.Client) -> None:
        self._client = client
        self._logger = create_logger("d2r2-bot")

        self._logger.info("Bot initialized")

        self._modules: List[BotModule] = []

        self._init_callbacks()
        self._logger.info("Callbacks of bot initialized")

    def _init_callbacks(self) -> None:
        @self._client.event
        async def on_ready():
            self._logger.info("Ready (as %s)", self._client.user)

        @self._client.event
        async def on_message(message) -> None:
            for module in self._modules:
                await module.on_message(message)

    def add_module(self, module: BotModule) -> None:
        """
        Add a bot module to the Bot
        """
        module.set_client(self._client)
        self._modules.append(module)


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
