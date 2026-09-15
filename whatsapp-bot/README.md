# Comprehensive Guide: Deploying CodeChat WhatsApp Bot on Azure

This document contains the exact step-by-step process we used to deploy the CodeChat WhatsApp API to an Azure Virtual Machine, including all troubleshooting and commands. I will keep this updated as we progress!

---

## Phase 1: Creating the Azure Virtual Machine

### 1. Configure the Basics
1. Log into your [Azure Portal](https://portal.azure.com).
2. Go to **Virtual Machines** -> **Create**.
3. Under **Resource Group**, click **"Create new"** and name it `famba-resources`. (A resource group is just a "folder" to keep related services organized).
4. Under **Size**, click "See all sizes" and search for **Standard_B2ats_v2** (or `Standard_B1s`). Make sure it says "Free services eligible sizes". (This uses your 750 free hours/month, so it won't touch your $100 credit).
5. Under **Authentication type**, choose **Password**. Enter a username (e.g., `kunakatech`) and a secure password.

### 2. Configure Networking & Ports
1. Under **Inbound port rules**, check the boxes for **HTTP (80)**, **HTTPS (443)**, and **SSH (22)**.
2. Click the blue **Review + create** button at the bottom, and then click **Create**.

### 3. Fix the Missing Public IP Address (If Applicable)
Sometimes Azure defaults to not giving the VM a Public IP. If your VM only has a Private IP (e.g., `10.1.1.4`):
1. On the left-hand menu of your VM, click **Networking**.
2. Click the blue link next to **Network Interface** (e.g., `famba-vnet...`).
3. Click **IP configurations** on the left menu.
4. Click on `ipconfig1`.
5. Under **Public IP address**, check **Associate**.
6. Click **Create new**, name it `famba-ip`, and click OK.
7. Click **Save** at the top. You now have a Public IP!

### 4. Open Port 8080
We need to manually open port 8080 for CodeChat:
1. Go back to your Virtual Machine's **Networking** tab.
2. Click **Add inbound port rule**.
3. Leave **Source port ranges** as `*`.
4. Change **Destination port ranges** to `8080`.
5. Click **Add**.

---

## Phase 2: Connecting and Installing Docker

### 1. SSH into the Server
Open Command Prompt or PowerShell on your local Windows computer and run:
```bash
ssh kunakatech@<YOUR_PUBLIC_IP_ADDRESS>
```
Type `yes` when prompted, and enter your password (it will be invisible as you type).

### 2. Install Docker
Once inside the server (you'll see `kunakatech@famba:~$`), paste this block of commands to install Docker:
```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### 3. Refresh Permissions
Log out and log back in so the Docker permissions apply:
```bash
exit
```
Then hit the "Up" arrow key on your keyboard to run the `ssh` command and log back in!

---

## Phase 3: Starting CodeChat

Once logged back in, copy and paste this entire block of code. It will create a folder, generate the `docker-compose.yml` configuration file, and start the servers!

```bash
mkdir -p whatsapp-bot
cd whatsapp-bot

cat << 'EOF' > docker-compose.yml
version: '3.8'
services:
  codechat:
    image: codechat/api:latest
    container_name: codechat_api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_PORT=8080
      - DB_PROVIDER=postgresql
      - POSTGRES_DB=codechat
      - POSTGRES_USER=codechat
      - POSTGRES_PASSWORD=codechat_pass
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - REDIS_URI=redis://redis:6379
      - AUTH_SECRET=famba_super_secret_whatsapp_key_2026
      - WEBHOOK_GLOBAL_URL=https://famba.co.zw/api/whatsapp/webhook
      - WEBHOOK_GLOBAL_ENABLED=true
      - WEBHOOK_GLOBAL_EVENTS=messages.upsert
    depends_on:
      - postgres
      - redis
    networks:
      - codechat_net

  postgres:
    image: postgres:15-alpine
    container_name: codechat_postgres
    restart: always
    environment:
      - POSTGRES_DB=codechat
      - POSTGRES_USER=codechat
      - POSTGRES_PASSWORD=codechat_pass
    volumes:
      - codechat_pgdata:/var/lib/postgresql/data
    networks:
      - codechat_net

  redis:
    image: redis:7-alpine
    container_name: codechat_redis
    restart: always
    volumes:
      - codechat_redisdata:/data
    networks:
      - codechat_net

volumes:
  codechat_pgdata:
  codechat_redisdata:

networks:
  codechat_net:
EOF

docker-compose up -d
```

---

## Phase 4: Generate QR Code & Connect Phone
Now that the server is running, we need to create a WhatsApp instance and get the QR code.

### 1. Create the Instance
Run this command in your server terminal:
```bash
curl -X POST "http://localhost:8080/instance/create" \
  -H "apikey: famba_super_secret_whatsapp_key_2026" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "famba"}'
```

### 2. Request the QR Code
Run this command in your server terminal:
```bash
curl -X GET "http://localhost:8080/instance/connect/famba" \
  -H "apikey: famba_super_secret_whatsapp_key_2026"
```
This will print out a giant block of text starting with `{"base64":"data:image/png;base64,...`.

### 3. Scan the QR Code
1. Copy that entire `data:image/png;base64,...` text (don't include the quotes).
2. Go to [base64-to-image.com](https://base64-to-image.com/) and paste it in to reveal the QR code.
3. Open WhatsApp on the bot's phone, go to **Settings → Linked Devices**, and scan the QR code.

Once scanned, your bot is LIVE and connected to your Render backend!

---

## Phase 5: Chatwoot — Customer Support Inbox

Chatwoot gives you (and your agents) a professional inbox to monitor all WhatsApp conversations and jump in to help customers when needed.

### Key Details
| Item | Value |
|------|-------|
| Chatwoot URL | https://app.chatwoot.com |
| Account ID | `186027` |
| Inbox Name | `Famba` |
| Inbox Token | `rERwTm4azsC4AUwFFdmHMEjg` |

### Steps Taken
1. Signed up at [app.chatwoot.com](https://app.chatwoot.com).
2. Went to **Settings → Inboxes → Add Inbox**.
3. Chose **API** as the channel type.
4. Named it `Famba` and clicked **Create API Channel**.
5. Noted the Account ID (`186027`) and Inbox Token.

### Connect CodeChat to Chatwoot
Re-create the `docker-compose.yml` on the Azure server with the Chatwoot variables added, then restart:
```bash
cd ~/whatsapp-bot

cat << 'EOF' > docker-compose.yml
version: '3.8'
services:
  codechat:
    image: codechat/api:latest
    container_name: codechat_api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_PORT=8080
      - DB_PROVIDER=postgresql
      - POSTGRES_DB=codechat
      - POSTGRES_USER=codechat
      - POSTGRES_PASSWORD=codechat_pass
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - REDIS_URI=redis://redis:6379
      - AUTH_SECRET=famba_super_secret_whatsapp_key_2026
      - WEBHOOK_GLOBAL_URL=https://famba.co.zw/api/whatsapp/webhook
      - WEBHOOK_GLOBAL_ENABLED=true
      - WEBHOOK_GLOBAL_EVENTS=messages.upsert
      - CHATWOOT_URL=https://app.chatwoot.com
      - CHATWOOT_ACCOUNT_ID=186027
      - CHATWOOT_TOKEN=rERwTm4azsC4AUwFFdmHMEjg
    depends_on:
      - postgres
      - redis
    networks:
      - codechat_net

  postgres:
    image: postgres:15-alpine
    container_name: codechat_postgres
    restart: always
    environment:
      - POSTGRES_DB=codechat
      - POSTGRES_USER=codechat
      - POSTGRES_PASSWORD=codechat_pass
    volumes:
      - codechat_pgdata:/var/lib/postgresql/data
    networks:
      - codechat_net

  redis:
    image: redis:7-alpine
    container_name: codechat_redis
    restart: always
    volumes:
      - codechat_redisdata:/data
    networks:
      - codechat_net

volumes:
  codechat_pgdata:
  codechat_redisdata:

networks:
  codechat_net:
EOF

docker-compose up -d --force-recreate codechat
```

### How Chatwoot Works
- Every WhatsApp message a customer sends will appear in your Chatwoot inbox at [app.chatwoot.com](https://app.chatwoot.com).
- The Famba bot replies automatically. You can see everything in Chatwoot.
- If a customer needs human help, you (or an agent) can type a reply directly in Chatwoot and it will be sent back to the customer on WhatsApp!

---

## Phase 6: Generate QR Code & Connect Your Phone
> ⏸️ **PAUSED HERE** — Server is running, containers are up. Resume from Step 1 below when ready.

### Step 1 — Create the WhatsApp Instance
Run this in your SSH terminal:
```bash
curl -X POST "http://localhost:8080/instance/create" \
  -H "apikey: famba_super_secret_whatsapp_key_2026" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "famba"}'
```

### Step 2 — Get the QR Code
```bash
curl -X GET "http://localhost:8080/instance/connect/famba" \
  -H "apikey: famba_super_secret_whatsapp_key_2026"
```
This prints a giant `data:image/png;base64,...` string.

### Step 3 — Decode & Scan
1. Copy the base64 text from the output.
2. Paste it at [base64-to-image.com](https://base64-to-image.com/) to see the QR code.
3. Open WhatsApp on the bot phone → **Settings → Linked Devices → Link a Device** and scan!

---

## 🐛 Troubleshooting Log & Lessons Learned

This section documents real problems we hit and how we fixed them. Use this to avoid the same mistakes!

---

### ❌ Problem 1: Ubuntu 22.04 mentioned but Azure shows 24.04
**Question asked:** "there is Ubuntu 24.04"
**Answer:** Ubuntu 24.04 LTS is perfectly fine. It's just a newer version. All Docker commands are identical.
**Fix:** Select Ubuntu 24.04 LTS (or 22.04 — both work).

---

### ❌ Problem 2: Azure showed B2 sizes, not B1s
**Question asked:** "am seeing b2 bros how to search for b1"
**Answer:** Click **"See all sizes"** link under the Size dropdown. In the search bar type `B1s`. If it doesn't appear, change the **Region** to East US or Canada Central.
**Lesson:** Azure is retiring B1s in favour of the newer `Standard_B2ats_v2` which is also free-tier eligible.

---

### ❌ Problem 3: No Public IP on the VM after creation
**What happened:** The VM was created but only had a Private IP (`10.1.1.4`). Could not SSH in.
**Fix:**
1. VM → Networking → Click the Network Interface blue link.
2. IP configurations → ipconfig1 → Associate a new Public IP.
3. Name it `famba-ip` → Save.

---

### ❌ Problem 4: Port 8080 not in the inbound ports list during VM creation
**Question asked:** "what about here" (showing the port selection screen with only 80, 443, 22)
**Answer:** Azure only shows 80, 443, and 22 on the creation screen. Select those three. Port 8080 must be added manually after the VM is created via **Networking → Add inbound port rule**.
**Commands:** Source port range = `*`, Destination port range = `8080`, click Add.

---

### ❌ Problem 5: `docker-compose up -d --force-recreate` crashed with `KeyError: 'ContainerConfig'`
**Error:** `KeyError: 'ContainerConfig'`
**Cause:** Old `docker-compose` v1.29.2 has a bug where it can't recreate containers from newer Docker images using `--force-recreate`.
**Fix:** Instead of `--force-recreate`, use:
```bash
docker-compose down
docker-compose up -d
```
This cleanly stops and restarts all containers without the bug.

---

### ❌ Mistake by AI: Port 8080 listed in initial VM creation step
**What happened:** The original README said to open port 8080 during VM creation. Azure's UI only allows 80, 443, and 22 at that step.
**Correction:** Port 8080 must be opened separately after creation in the Networking tab.

---

### 💡 Key Things to Know

| Question | Answer |
|----------|--------|
| Which WhatsApp to use for the bot? | WhatsApp Business (looks more professional) |
| Can I use 2 WhatsApp accounts on one phone? | Yes, on Android via Dual Apps/Clone App. Not on iPhone. |
| Where do I see customer messages? | In Chatwoot at app.chatwoot.com |
| Will the bot cost money? | No — B2ats_v2 is covered by the 750 free hours/month |
| What does "Subscription credits apply" mean? | Azure will subtract the cost using your free hours (net = $0) |
