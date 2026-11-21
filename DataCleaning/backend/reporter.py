class Reporter:
    def __init__(self):
        self.report = []
    def add(self,proc : str):
        print("Operation "+proc)
        self.report.append(proc)