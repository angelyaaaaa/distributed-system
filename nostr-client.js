// import { generatePrivateKey, getPublicKey } from 'nostr-tools';
import {
  getEventHash,
  signEvent,
  relayInit,
} from 'nostr-tools';
import { config } from 'dotenv';
import 'websocket-polyfill';

await config();
const RELAY_URL = 'wss://relay.nekolicio.us/'
const NOSTR_PUBLIC_KEY = 'd6e299a006f9baa6f0bf41c67c1d42658bdb54298a246a6a23ceb22bf218311d';
const NOSTR_PRIVATE_KEY = process.env.NOSTR_PRIVATE_KEY;

// NOTE: relay settings
const relay = relayInit(RELAY_URL);
relay.on('connect', () => { console.log(`connected to ${relay.url}`) });
relay.on('error', () => { console.log(`failed to connect to ${relay.url}`) });

await relay.connect()

const sub = relay.sub([
  {
    kinds: [1],
    authors: [NOSTR_PUBLIC_KEY]
  }
])
sub.on('event', event => { console.log('got event:', event) });

// NOTE: event settings
let event = {
  kind: 123,
  pubkey: NOSTR_PUBLIC_KEY,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'hello world john'
}
event.id = getEventHash(event);
event.sig = signEvent(event, NOSTR_PRIVATE_KEY);

// NOTE: publish event setting
let pub = relay.publish(event)
pub.on('ok', () => { console.log(`${relay.url} has accepted our event`, relay) });
pub.on('failed', reason => { console.log(`failed to publish to ${relay.url}: ${reason}`) });

setTimeout(() => {
  relay.close()
  console.log('connection closed')
}, 5000);
