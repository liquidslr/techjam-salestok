## SalesTok

This project was built as a part of [2024 TitkTok TechJam](https://tiktoktechjam2024.devpost.com/)

A video demo can be found [here](https://www.youtube.com/watch?v=CRF9rptJKwc)

### Inspiration

The idea for the SalesTok was born from observing the growing complexity and demands on sales teams in today’s competitive market. Sales professionals often juggle numerous tasks, from managing customer relationships to generating leads and closing deals. We thought, “Why not give them a little AI buddy to make their lives easier?” With the recent advancements in AI, we saw an opportunity to leverage these technologies to streamline sales processes, enhance efficiency, and provide real-time actionable insights.

### How we built it

1. **Dataset Selection and Preparation** We carefully selected and prepared open datasets that adhered to licensing and utilization restrictions, ensuring they were free from sensitive information and bias. No datasets were harmed in the making of this project.
2. **ASR Integration:** We integrated open-source ASR tools to transcribe real-time audio calls, serving as the foundation for subsequent functionalities. We did have a few hiccups—like transcribing “Can you fax it?” as “Can you tax it?”—but nothing too major.
3. **LLM Wrapper Development:** Using pre-trained language models, we developed features for narrative recommendation, narrative safeguard, and dialogue summarization. Our models are like those friends who always know the right thing to say, but without the awkward silences.
4. **Emotion and Sentiment Analysis:** We implemented sentiment analysis tools to evaluate customer emotions during conversations.
   Task Management System: We designed an intelligent system to analyze conversations, generate ToDo lists, and set reminders for sales personnel. It’s like having a personal assistant who never sleeps (or drinks your coffee).

### Key Learnings

1. **Automatic Speech Recognition (ASR):** Implementing ASR technology to convert speech to text in real-time during sales calls. We also learned that sometimes, ASR can turn “I need a big discount” into “I need a big donut,” which led to some interesting conversations.
2. **Natural Language Processing (NLP):** Developing capabilities for narrative recommendation and safeguard by understanding and generating context-aware language.
3. **AI-Driven Task Management:** Creating intelligent reminders and ToDo lists based on conversations with an assistant that not only remembers everything but also nudges you persistently.
4. **Knowledge Base Creation:** Building a system that learns from successful sales experiences to guide new sales personnel.

