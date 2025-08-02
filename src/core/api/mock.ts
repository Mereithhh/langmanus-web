import { type Message } from "../messaging";
import { timeout } from "../utils";

import mock from "./mock.txt";
import { type ChatEvent } from "./types";

export async function* chatStream(
  userMessage: Message,
): AsyncIterable<ChatEvent> {
  for (const chunk of mock.split("\n\n")) {
    const lines = chunk.split("\n");
    let event: string | undefined;
    let data: string | undefined;
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        event = line.slice(7);
      } else if (line.startsWith("data: ")) {
        data = line.slice(6);
      }
    }
    if (event && data) {
      if (event === "message") {
        await timeout(0);
      } else {
        await timeout(0);
      }
      let data_obj: ChatEvent["data"] | undefined;
      try {
         data_obj = JSON.parse(data) as ChatEvent["data"];
      } catch (err) {
        console.log("parse data error", data);
      }
      yield {
        type: event as ChatEvent["type"],
        data: data_obj,
      } as ChatEvent;
    }
  }
}
