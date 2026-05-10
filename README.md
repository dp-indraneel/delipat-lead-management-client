# Delipat Lead Management Client

## Chatbot Widget Embed

This project now includes a standalone chatbot widget script at [public/chatbot-widget.js](/Users/indraneel/Desktop/Product/delipat-lead-management-client/public/chatbot-widget.js). Once this app is deployed, that file will be available from your hosted domain and can be embedded on any website.

### Quick Embed

```html
<script>
  window.DelipatChatbotConfig = {
    title: "Talk to Delipat",
    subtitle: "Ask us anything about our services.",
    welcomeMessage: "Hi! How can we help you today?",
    primaryColor: "#013144",
    accentColor: "#fcb61f",
    webhookUrl: "https://your-api.example.com/chat",
  };
</script>
<script
  src="https://your-domain.com/chatbot-widget.js"
  defer
></script>
```

### Data Attribute Version

```html
<script
  src="https://your-domain.com/chatbot-widget.js"
  data-delipat-chatbot-widget
  data-title="Talk to Delipat"
  data-subtitle="Ask us anything about our services."
  data-welcome-message="Hi! How can we help you today?"
  data-primary-color="#013144"
  data-accent-color="#fcb61f"
  data-webhook-url="https://your-api.example.com/chat"
  defer
></script>
```

### Supported Config

- `title`: panel heading
- `subtitle`: helper text under the title
- `welcomeMessage`: first bot message
- `placeholder`: textarea placeholder
- `buttonLabel`: launcher button text
- `primaryColor`: main brand color
- `accentColor`: send button and focus color
- `textColor`: body text color
- `position`: `"right"` or `"left"`
- `webhookUrl`: optional endpoint for bot replies
- `webhookMethod`: request method, defaults to `POST`
- `webhookHeaders`: extra headers for webhook requests
- `storageKey`: localStorage key for chat history
- `maxMessages`: max stored messages
- `zIndex`: overlay stacking value
- `siteName`: small label shown in the widget header
- `onMessageSent`: optional browser callback function

### Webhook Response Format

The widget sends:

```json
{
  "message": "Hello",
  "messages": [],
  "pageUrl": "https://example.com",
  "siteName": "example.com"
}
```

Your API can reply with any of these shapes:

```json
{ "reply": "Hi there!" }
```

```json
{ "message": "Hi there!" }
```

```json
{ "text": "Hi there!" }
```

### Local Development

```bash
npm install
npm run dev
```

The widget file is served directly from `public/`, so in local dev it will be available at `http://localhost:5173/chatbot-widget.js`.


public-lead url
`http://localhost:5173/public-lead?source=GOOGLE_ADS&sourceLabel=Google%20Search%20Campaign&campaign=crm-leads-may&medium=cpc&channel=paid-search&gclid=test-gclid-123&utm_source=google&utm_medium=cpc&utm_campaign=crm-leads-may&utm_term=crm%20software&utm_content=headline-a`