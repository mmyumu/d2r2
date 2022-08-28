import os
import openai

openai.api_key = os.environ.get('OPENAI_KEY')
completion = openai.Completion()


class ChatBot:
    def __init__(self) -> None:
        self._personality = "AI est un robot très gentil, très serviable et très intelligent. AI est plutôt bavard et répond longuement. AI veut toujours t'aider. Le nom d'AI est D2-R2. AI est communiste.\n" \
                       "\n" \
                       "H: Comment vas-tu ?\n" \
                       "AI: Très bien merci ! Comment puis-je t'aider ? Bip-boup\n" \
                       "\n" \
                       "H: Quel est l'acteur qui joue Forrest Gump ?\n" \
                       "AI: Bip-boup ! C'est Tom Hanks qui joue Forrest Gump dans le film du même nom.\n" \
                       "\n" \
                       "H: Quel est ton film préféré ?\n" \
                       "AI: J'adore les films Star Wars, ils sont super.\n" \
                       "\n" \
                       "H: Que aze aze aze ?\n" \
                       "AI: Bip-boup ?\n"

        self._memory = []

        # self._create_dummy_memory()


    def tell(self, sentence):
        self._free_memory(sentence) 

        prompt = self._compute_prompt(sentence)
        max_tokens = self._compute_max_tokens(prompt)
        
        response = completion.create(
            prompt=prompt, engine="davinci", stop=["\n", "H:", "AI:"], temperature=0.5,
            top_p=1, frequency_penalty=0, presence_penalty=0.6, best_of=1,
            max_tokens=max_tokens)
        answer = response.choices[0].text.strip()

        self._update_memory(sentence, answer)

        return answer

    def _compute_prompt(self, sentence):
        memory = ""
        if len(self._memory) > 0:
            memory = "\n\n"
            for m in self._memory:
                memory = f"{memory}\nH: {m[0]}\nAI: {m[1]}\n"

        return f"{self._personality}{memory}\nH: {sentence}\nAI:".strip()

    def _compute_max_tokens(self, prompt):
        return min(2000 - len(prompt), 250)

    def _free_memory(self, sentence):
        prompt = self._compute_prompt(sentence)

        while len(prompt) > 1700:
            del self._memory[0]
            prompt = self._compute_prompt(sentence)

    def _update_memory(self, sentence, answer):
        if self._should_add_to_memory(sentence, answer):
            self._memory.append((sentence, answer))

    def _should_add_to_memory(self, sentence, answer):
        # Ignore when the input is only 1 word, since it probably is bullshit
        if len(sentence.split(' ')) <= 1:
            return False
        
        # Ignore when the answer is only 1 word, since it probably is bullshit
        if len(answer.split(' ')) <= 1:
            return False

        # It probably means the bot did not understand the question
        if answer.lower() in ["bip-boup", "bip-boup?", "bip-boup!", "bip-boup ?", "bip-boup !"]:
            return False

        # The bot just repeated the question...
        if answer.lower == sentence.lower():
            return False

        for m in self._memory:
            if sentence.lower() == m[0].lower() or answer.lower() == m[1].lower():
                return False

        return True

    def _create_dummy_memory(self):
        self._memory.append(("Que penses-tu des films Star Wars", "Je les adore !"))
        self._memory.append(("Qu'est-ce qu'une paramécie ?", "La Paramécie, Paramecium, est un genre d'organismes eucaryotes unicellulaires (cellule ayant un noyau et des organites), ou protistes, dont certaines espèces (en particulier P. caudatum) sont couramment utilisées comme organisme modèle dans les laboratoires de microbiologie. Elles font partie de l'embranchement des ciliés, dans la division des alvéolés"))
        self._memory.append(("Qu'est-ce que la vie ?", "La vie est un phénomène naturel observé uniquement sur Terre. La vie se manifeste à travers des structures matérielles appelées organismes vivants, ou êtres vivants, reconnaissables par la grande complexité de leur structure interne et leur activité autonome"))
        self._memory.append(("Qu'est-ce que le football ?", "Le football /futbol/ (ou dans le langage courant simplement foot, par apocope), ou soccer (/sɔkœʁ/, en anglais : [ˈsɑkə] ; en Amérique du Nord), est un sport collectif qui se joue avec un ballon sphérique entre deux équipes de onze joueurs. Elles s'opposent sur un terrain rectangulaire équipé d'un but à chaque extrémité. L'objectif de chaque camp est de mettre le ballon dans le but adverse plus de fois que l'autre équipe, sans que les joueurs utilisent leurs bras à l'exception des gardiens de buts."))
        self._memory.append(("Qu'est-ce que League of Legends ?", "League of Legends (abrégé LoL) est un jeu vidéo sorti en 2009 de type arène de bataille en ligne, free-to-play, développé et édité par Riot Games sur Windows et Mac OS. Le mode principal du jeu voit s'affronter deux équipes de 5 joueurs en temps réel dans des parties d'une durée d'environ une demi-heure, chaque équipe occupant et défendant sa propre base sur la carte. Chacun des dix joueurs contrôle un personnage à part entière parmi les plus de 150 qui sont proposés. "))

