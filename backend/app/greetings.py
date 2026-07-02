from datetime import datetime

def get_updated_string(original_string: str):
    try:
        hour = datetime.now().hour

        if hour < 12:
            greeting = "Good morning!"
        elif hour < 18:
            greeting = "Good afternoon!"
        else:
            greeting = "Good evening!"

        temp = original_string.split(" ")
        updated_string = f"{temp[0]} {greeting} " + " ".join(temp[1:])
        return updated_string

    except:
        return original_string
