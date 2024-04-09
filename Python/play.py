import random

from nim import train,play

ai=train(0)
play(ai)

def nim_game(piles):
    """
    Determine if the current player is in a winning position.
    :param piles: a list of integers representing the number of stones in each pile
    :return: True if the current player can win the game, False otherwise
    """
    xor = 0
    for pile in piles:
        xor ^= pile
    return xor != 0

def play_game():
    """
    Play a game of Nim against the computer.
    """
    piles = [3, 4, 5]  # start with 3 piles of 3, 4, and 5 stones
    while True:
        print("Current piles:", piles)
        pile = int(input("Choose a pile: "))
        stones = int(input("Choose number of stones to remove: "))
        piles[pile] -= stones
        if sum(piles) == 0:
            print("You win!")
            break
        pile = random.choice([i for i, pile in enumerate(piles) if pile > 0])
        stones = random.randint(1, piles[pile])
        print(f"Computer removes {stones} stones from pile {pile}")
        piles[pile] -= stones
        if sum(piles) == 0:
            print("Computer wins!")
            break

play_game()
