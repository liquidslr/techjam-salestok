



class StatusConstants:
    OPPORTUNITY = 1
    PROPOSAL = 2
    IN_NEGOTIATION = 3
    WON = 4
    LOST = 5
    PC = 6
    DELAYED = 7

    CHOICES = (
        (OPPORTUNITY, "opportunity"),
        (PROPOSAL, "proposal-sent"),
        (IN_NEGOTIATION, "in-negotiation"),
        (WON, "won"),
        (LOST, "lost"),
        (DELAYED, "delayed"),
    )


class CategoryConstants:
    COPYWRITING = 1
    PRINT = 2
    UI = 3
    WEBSITE = 4
    OTHER = 5

    CHOICES = (
        (COPYWRITING, "Copywriting"),
        (PRINT, "Print project"),
        (UI, "UI Desging"),
        (WEBSITE, "Website Design"),
        (OTHER, "Other"),
    )

