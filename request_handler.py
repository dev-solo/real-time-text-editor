""" This actions dublicate algorithm in main.js. Used to apply changes into server side for new clients """
import json

class RequestHandler():
    def patch(self, str, index, selection, value):
        return str[0:index] + value + str[index + selection:]

    def execute_action(self, text):
        if self.action == 'patch':
            text = self.patch(text, self.position, self.selection, self.text)
        return text
    def __init__(self, data):
        data = json.loads(data)
        self.action = data['action']
        self.position = data['position']
        self.selection = data['selection']
        self.text = data['text']