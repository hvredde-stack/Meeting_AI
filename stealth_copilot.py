import threading
import queue
import time
import tkinter as tk
from pynput import keyboard
import pyaudio
import websocket
import json
import requests

# ========================
# API Keys
# ========================

import config
GROQ_API_KEY = config.GROQ_API_KEY
ASSEMBLYAI_API_KEY = config.ASSEMBLYAI_API_KEY

AI_MODEL = "llama-3.3-70b-versatile"

HOTKEY = '<ctrl>+<alt>+h'

WINDOW_WIDTH = 520
WINDOW_HEIGHT = 480
WINDOW_OPACITY = 0.92
BACKGROUND_COLOR = "black"
TEXT_COLOR = "lime"
FONT_SIZE = 14

CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000

# ========================
# Globals
# ========================

answer_queue = queue.Queue()
window_visible = True
root = None
current_interim = ""
ws = None
text_to_display = ""
display_index = 0

# ========================
# Groq response
# ========================

def get_ai_response(transcript):
    print(f"[DEBUG] Sending to Groq: {transcript[:100]}...")
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": AI_MODEL,
        "messages": [
            {"role": "system", "content": "Expert interview coach. Concise, natural bullet-point answers the candidate can say confidently."},
            {"role": "user", "content": f"Question: {transcript}"}
        ],
        "max_tokens": 400,
        "temperature": 0.6
    }
    try:
        r = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=20)
        r.raise_for_status()
        answer = r.json()["choices"][0]["message"]["content"].strip()
        print("[DEBUG] Groq response received")
        return answer
    except Exception as e:
        print(f"[DEBUG] Groq error: {e}")
        return f"AI Error: {str(e)}"

# ========================
# WebSocket callbacks
# ========================

def on_message(ws, message):
    global current_interim
    try:
        data = json.loads(message)
        msg_type = data.get("type")

        if msg_type == "Turn":
            transcript = data.get("transcript", "")
            end_of_turn = data.get("end_of_turn", False)

            if end_of_turn:
                full = (current_interim + " " + transcript).strip()
                print(f"\n[DEBUG] Final question detected: {full}\n")
                if len(full) > 20:
                    answer_queue.put(get_ai_response(full))
                current_interim = ""
            else:
                current_interim = transcript
                print(f"[DEBUG] Interim: {transcript}", end="\r", flush=True)

        elif msg_type == "Begin":
            print(f"[DEBUG] AssemblyAI session started: {data.get('id')}")

        else:
            print(f"[DEBUG] Other message: {msg_type}")

    except Exception as e:
        print(f"\n[DEBUG] Message error: {e}")

def on_error(ws, error):
    print(f"\n[DEBUG] WebSocket error: {error}")

def on_close(ws, close_status_code, close_msg):
    print(f"\n[DEBUG] WebSocket closed: {close_status_code} - {close_msg}")

def on_open(ws):
    print("[DEBUG] WebSocket connected successfully!")

# ========================
# WebSocket streaming with debug
# ========================

def websocket_stream():
    global ws
    try:
        # Adjusted URL to make the end-of-turn detection less sensitive (waits for a longer pause)
        url = f"wss://streaming.assemblyai.com/v3/ws?sample_rate={RATE}&format_turns=true&end_of_turn_threshold_ms=3000"

        ws = websocket.WebSocketApp(
            url,
            header={"Authorization": ASSEMBLYAI_API_KEY},
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )

        print("[DEBUG] Opening PyAudio stream...")
        p = pyaudio.PyAudio()

        # List devices for debug
        print("[DEBUG] Available input devices:")
        for i in range(p.get_device_count()):
            dev = p.get_device_info_by_index(i)
            if dev['maxInputChannels'] > 0:
                print(f"  [{i}] {dev['name']}")

        # Try to find VB-Cable
        device_index = None
        for i in range(p.get_device_count()):
            dev = p.get_device_info_by_index(i)
            if dev['maxInputChannels'] > 0 and ('CABLE Output' in dev['name'] or 'VB-Audio' in dev['name']):
                device_index = i
                print(f"[DEBUG] Using VB-Audio device: {dev['name']} (index {i})")
                break

        if device_index is None:
            print("\n[FATAL] VB-CABLE device not found. Please ensure it's installed and enabled.")
            print("Please also check that the device name contains 'CABLE Output' or 'VB-Audio'")
            return  # Stop the thread

        stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, input_device_index=device_index, frames_per_buffer=CHUNK)

        print("[DEBUG] Audio stream opened. Starting WebSocket...")

        # Run WebSocket
        wst = threading.Thread(target=ws.run_forever)
        wst.daemon = True
        wst.start()

        # Wait for the connection to be established
        time.sleep(1)

        print("[DEBUG] Sending audio chunks now. Play sound routed to VB-CABLE Input to test.")

        while True:
            data = stream.read(CHUNK)
            print(".", end="", flush=True)  # <-- Key debug: dots = audio flowing
            ws.send(data, websocket.ABNF.OPCODE_BINARY)

    except Exception as e:
        print(f"\n[DEBUG] Connection failed: {e}")

# ========================
# GUI & hotkey
# ========================

def toggle_visibility():
    global window_visible
    if window_visible:
        root.withdraw()
    else:
        root.deiconify()
    window_visible = not window_visible

def start_hotkey_listener():
    hotkey = keyboard.HotKey(keyboard.HotKey.parse(HOTKEY), toggle_visibility)
    with keyboard.Listener(on_press=lambda k: hotkey.press(k), on_release=hotkey.release) as listener:
        listener.join()

root = tk.Tk()
root.title("Stealth Copilot")
root.configure(bg=BACKGROUND_COLOR)
root.attributes("-topmost", True)
root.attributes("-alpha", WINDOW_OPACITY)
root.overrideredirect(True)
root.geometry(f"{WINDOW_WIDTH}x{WINDOW_HEIGHT}+100+100")

def start_drag(e): root.x = e.x; root.y = e.y
def stop_drag(e): root.x = None; root.y = None
def drag(e):
    if hasattr(root, 'x') and root.x is not None:
        dx = e.x - root.x
        dy = e.y - root.y
        root.geometry(f"+{root.winfo_x() + dx}+{root.winfo_y() + dy}")

root.bind("<ButtonPress-1>", start_drag)
root.bind("<ButtonRelease-1>", stop_drag)
root.bind("<B1-Motion>", drag)

text_widget = tk.Text(root, bg=BACKGROUND_COLOR, fg=TEXT_COLOR, font=("Consolas", FONT_SIZE),
                      wrap=tk.WORD, padx=20, pady=20, relief=tk.FLAT)
text_widget.pack(fill=tk.BOTH, expand=True)
text_widget.insert(tk.END, "Stealth Copilot is active. Listening for questions via VB-Cable...\n")

def update_display():
    global text_to_display, display_index
    try:
        # Check if there's a new answer to display
        if not answer_queue.empty():
            text_to_display = answer_queue.get_nowait()
            display_index = 0
            text_widget.delete(1.0, tk.END)

        # Typewriter effect: display one character at a time
        if display_index < len(text_to_display):
            text_widget.insert(tk.END, text_to_display[display_index])
            display_index += 1
            text_widget.see(tk.END)

    except queue.Empty:
        pass  # This is expected when the queue is empty
    except Exception as e:
        print(f"[GUI ERROR] Failed to update display: {e}")
    
    # Reschedule the update
    root.after(20, update_display)

# ========================
# Launch
# ========================

threading.Thread(target=websocket_stream, daemon=True).start()
threading.Thread(target=start_hotkey_listener, daemon=True).start()

root.after(20, update_display)
print("Stealth Copilot launched! • Drag • Ctrl+Alt+H to hide\n")

root.mainloop()