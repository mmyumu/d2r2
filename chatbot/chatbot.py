import os
import random
import datetime

import openai


openai.api_key = os.environ.get('OPENAI_KEY')
completion = openai.Completion()

MOODS = {"bonne": "D2-R2 est de très bonne humeur.",
         "mauvaise": "D2-R2 est de très mauvaise humeur.",
         "moyenne": "D2-R2 est d'humeur moyenne.",
         "euphorique": "D2-R2 est euphorique, il adore écrire en majuscule"}


TOPICS = {"blagues": "D2-R2 adore dire des blagues.",
          "profond": "D2-R2 veut discuter de sujets très profonds tels que la destinée, la mort, le sens de la vie.",
          "rien": ""}


class ChatBot:
    def __init__(self, debug) -> None:
        self._debug = debug
        self._name = "D2-R2"

        self._personality = f"{self._name} est un assistant robot. {self._name} est serviable, créatif, intelligent et très sympathique."

        self.mood = None

        self._examples = "Dakey: Qu'est-ce qu'un robot ?\n" \
            f"{self._name}: Un robot est un dispositif mécatronique (alliant mécanique, électronique et informatique) conçu pour accomplir automatiquement des tâches imitant ou reproduisant, "\
            "dans un domaine précis, des actions humaines. La conception de ces systèmes est l'objet d'une discipline scientifique, branche de l'automatisme nommée robotique." \

        self._memory = []

        self._temperature = 0.9
        self._frequency_penalty = 0.5
        self._presence_penalty = 0.6

        self._last_tell = None
        self._last_mood_update = None

        self._update_mood()

    def tell(self, user, sentence):
        assert user is not None
        assert sentence is not None

        self._update_mood()

        self._free_memory(user, sentence)

        prompt = self._compute_prompt(user, sentence)
        max_tokens = self._compute_max_tokens(prompt)

        if self._debug:
            answer = f"My debug answer to {user}"
        else:
            response = completion.create(prompt=prompt, engine="davinci", stop=["\n", f"{self._name}:"], temperature=self._temperature,
                                        top_p=1, frequency_penalty=self._frequency_penalty, presence_penalty=self._presence_penalty, best_of=1,
                                        max_tokens=max_tokens)
            answer = response.choices[0].text.strip()

        self._update_memory(user, sentence, answer)

        self._last_tell = datetime.datetime.now()

        return self._robotify(answer)

    def set_mood(self, key_mood=None, key_topic=None):
        self.mood = self._compute_mood(key_mood=key_mood, key_topic=key_topic)

    def temperature(self, temperature: float):
        self._temperature = temperature

    def frequency_penalty(self, frequency_penalty: float):
        self._frequency_penalty = frequency_penalty

    def presence_penalty(self, presence_penalty: float):
        self._presence_penalty = presence_penalty

    def erase_memory(self):
        self._memory = []

    def debug_str(self):
        debug_prompt = self._compute_prompt("Humain", "Debug")
        max_tokens = self._compute_max_tokens(debug_prompt)
        params = f"frequency_penalty={self._frequency_penalty}, presence_penalty={self._presence_penalty}, temperature={self._temperature}, max_tokens={max_tokens}, debug={self._debug}"

        last_tell = None
        if self._last_tell:
            last_tell = self._last_tell.strftime("%m/%d/%Y, %H:%M:%S")
        last_mood = None
        if self._last_mood_update:    
            last_mood = self._last_mood_update.strftime("%m/%d/%Y, %H:%M:%S")

        params2 = f"last_tell={last_tell}, last_mood_update={last_mood}"

        return f"[{params}]\n[{params2}]\n{debug_prompt}"

    def _update_mood(self):
        update_mood = False
        now = datetime.datetime.now()

        # If never updated, then set the mood
        if self._last_mood_update is None:
            update_mood = True
        else:
            # If it's a new day and no one talked to the bot for 30mn
            if self._last_mood_update.day != now.day:
                if self._last_tell is None:
                    update_mood
                else:
                    diff_last_tell = now - self._last_tell
                    diff_mn = diff_last_tell.total_seconds() / 60

                    if diff_mn > 30:
                        update_mood = True

        if update_mood:
            self.mood = self._compute_mood()
            self._last_mood_update = now

    def _compute_mood(self, key_mood=None, key_topic=None):
        if key_mood and key_mood in MOODS:
            mood = MOODS[key_mood]
        else:
            mood = random.choice(list(MOODS.values()))

        if key_topic and key_topic in TOPICS:
            topic = TOPICS[key_topic]
        else:
            topic = random.choice(list(TOPICS.values()))

        return f"{mood} {topic}"

    def _compute_prompt(self, user, sentence):
        memory = ""
        if len(self._memory) > 0:
            # memory = ""
            for m in self._memory:
                memory = f"{memory}\n{m[0]}: {m[1]}\n{self._name}: {m[2]}\n"

        return f"{self._personality} {self.mood}\n\n{self._examples}\n{memory}\n{user}: {sentence}\n{self._name}:".strip()

    def _compute_max_tokens(self, prompt):
        return min(2000 - len(prompt), 350)

    def _free_memory(self, user, sentence):
        prompt = self._compute_prompt(user, sentence)

        while len(prompt) > 1700:
            del self._memory[0]
            prompt = self._compute_prompt(sentence)

    def _update_memory(self, user, sentence, answer):
        if self._should_add_to_memory(sentence, answer):
            self._memory.append((user, sentence, answer))

    def _should_add_to_memory(self, sentence, answer):
        a = answer.strip()

        # Ignore when the input is only 1 word, since it probably is bullshit
        if len(sentence.split(' ')) <= 1:
            return False

        # Ignore when the answer is only 1 word, since it probably is bullshit
        if len(a.split(' ')) <= 1:
            return False

        # It probably means the bot did not understand the question
        if a.lower() in ["bip-boup", "bip-boup?", "bip-boup!", "bip-boup.", "bip-boup ?", "bip-boup !", "bip-boup .", "?", "."]:
            return False

        # The bot just repeated the question...
        if a.lower == sentence.lower():
            return False

        for m in self._memory:
            if sentence.lower() == m[1].lower() or a.lower() == m[2].lower():
                return False

        return True

    def _robotify(self, s):
        r = random.random()

        if r < 0.2:
            return f"Bip-boup ! {s}"
        elif r < 0.4:
            return f"Bip-boup. {s}"
        elif r < 0.6:
            return f"{s} Bip-boup."
        elif r < 0.8:
            return f"{s} Bip-boup !"
        elif r < 1:
            return f"Bip ! {s} Boup."

    def dummy_memory(self):
        self._memory.append(("Humain", "Que penses-tu des films Star Wars", "Je les adore !"))
        self._memory.append(("Humain", "Qu'est-ce qu'une paramécie ?", "La Paramécie, Paramecium, est un genre d'organismes eucaryotes unicellulaires (cellule ayant un noyau et des organites), ou protistes, dont certaines espèces (en particulier P. caudatum) sont couramment utilisées comme organisme modèle dans les laboratoires de microbiologie. Elles font partie de l'embranchement des ciliés, dans la division des alvéolés"))
        self._memory.append(("Humain", "Qu'est-ce que la vie ?", "La vie est un phénomène naturel observé uniquement sur Terre. La vie se manifeste à travers des structures matérielles appelées organismes vivants, ou êtres vivants, reconnaissables par la grande complexité de leur structure interne et leur activité autonome"))
        self._memory.append(("Humain", "Qu'est-ce que le football ?",
                            "Le football /futbol/ (ou dans le langage courant simplement foot, par apocope), ou soccer, est un sport collectif qui se joue avec un ballon sphérique entre deux équipes de onze joueurs. Elles s'opposent sur un terrain rectangulaire équipé d'un but à chaque extrémité. L'objectif de chaque camp est de mettre le ballon dans le but adverse plus de fois que l'autre équipe, sans que les joueurs utilisent leurs bras à l'exception des gardiens de buts."))
        self._memory.append(("Humain1", "Qu'est-ce que League of Legends ?", "League of Legends (abrégé LoL) est un jeu vidéo sorti en 2009 de type arène de bataille en ligne, free-to-play, développé et édité par Riot Games sur Windows et Mac OS. Le mode principal du jeu voit s'affronter deux équipes de 5 joueurs en temps réel dans des parties d'une durée d'environ une demi-heure, chaque équipe occupant et défendant sa propre base sur la carte. Chacun des dix joueurs contrôle un personnage à part entière parmi les plus de 150 qui sont proposés. "))
        self._memory.append(("Humain2", "Qu'est-ce que la vie ?", "La vie est un phénomène naturel observé uniquement sur Terre. La vie se manifeste à travers des structures matérielles appelées organismes vivants, ou êtres vivants, reconnaissables par la grande complexité de leur structure interne et leur activité autonome"))
        self._memory.append(("Humain3", "Qu'est-ce que la vie ?", "La vie est un phénomène naturel observé uniquement sur Terre. La vie se manifeste à travers des structures matérielles appelées organismes vivants, ou êtres vivants, reconnaissables par la grande complexité de leur structure interne et leur activité autonome"))
        self._memory.append(("Humain4", "Qu'est-ce que la vie ?", "La vie est un phénomène naturel observé uniquement sur Terre. La vie se manifeste à travers des structures matérielles appelées organismes vivants, ou êtres vivants, reconnaissables par la grande complexité de leur structure interne et leur activité autonome"))
        self._memory.append(("Humain5", "Qu'est-ce que la vie ?", "La vie est un phénomène naturel observé uniquement sur Terre. La vie se manifeste à travers des structures matérielles appelées organismes vivants, ou êtres vivants, reconnaissables par la grande complexité de leur structure interne et leur activité autonome"))
