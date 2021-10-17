import logging
from abc import ABC, abstractmethod

import discord


class BotModule(ABC):
    """
    Abstract class for bot module
    """

    def __init__(self, client: discord.Client) -> None:
        self._client = client
        self._logger = self.create_logger()

        self._logger.info(f"Module {self.__class__.__name__} initialized")

        self._init_callbacks()
        self._logger.info(
            f"Callbacks of module {self.__class__.__name__} initialized")

    @abstractmethod
    def _init_callbacks(self):
        pass

    def create_logger(self):
        logger = logging.getLogger(
            f"d2r2-bot_module-{self.__class__.__name__}")
        logger.setLevel(logging.DEBUG)
        ch = logging.StreamHandler()
        ch.setLevel(logging.DEBUG)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        logger.addHandler(ch)

        return logger
