from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import re
import serial
#import pyserial
# Set Chrome options
chrome_options = Options()
'''chrome_options.add_argument("--use-fake-ui-for-media-stream")
chrome_options.add_argument("--use-fake-device-for-media-stream")
chrome_options.add_argument("--ignore-certificate-errors")
chrome_options.add_argument("--allow-insecure-localhost")
'''
# Initialize the Chrome driver with the service
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# Open the desired URL
driver.get('https://192.168.0.77:5500')


while True:
    html_content = driver.page_source 
    str(html_content)
    if html_content:
        if "PeerChat" in html_content:
            #Key pressed:\s([a-z])|DID:\s([0-9]*)|Dialogue: (.*)</div>, regex arguments
            key_press = re.search(r'Key pressed:\s([a-z])', html_content)
            dialogue = re.search(r'Dialogue: (.*)</div>', html_content)
            dialogue_ID = re.search(r'DID:\s([0-9]*)', html_content)
            info = {"key_presses": key_press, "dialogue": dialogue, "DID": dialogue_ID}
            if key_press:
                info["key_presses"] = key_press.group(1)
            if dialogue_ID:
                info["DID"] = dialogue_ID.group(1)
            if dialogue:
                info["dialogue"] = dialogue.group(1)
            print(info)
            time.sleep(.25)
   