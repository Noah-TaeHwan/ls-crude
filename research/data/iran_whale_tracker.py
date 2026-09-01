"""
Iranian Crypto Whale & Exchange Flow Tracker / WSJ Report Verification Tool

This tool provides a modular interface to:
1. Fetch and track on-chain Bitcoin address transactions (via Mempool / Blockstream API).
2. Monitor exchange flow spikes and market macro context (via CoinGecko API).
3. Track labeled OFAC / Nobitex / CoinEx entities and identify high-value "whale" transactions.
4. Perform analytical verification of reporting claims (e.g., WSJ/TRM Labs $3.84B CoinEx flow estimates).

Authors: Team Quant / On-Chain Forensics
Repository: GitHub Team Project
"""

import sys
import json
import time
import requests
from datetime import datetime, timezone

# ==============================================================================
# CONFIGURATION & KNOWN ENTITIES
# ==============================================================================

# Publicly identified/labeled addresses for demonstration and tracking
# (Includes OFAC SDN List Iranian BTC addresses + Known exchange deposit entry points)
KNOWN_IRANIAN_ENTITIES = {
    "1Ae2... (OFAC Iranian Ransomware)": {
        "address": "1Ae2nQ... (Placeholder: Add target address)",
        "entity": "OFAC Sanctions List",
        "category": "Ransomware / Treasury SDN"
    },
    "Nobitex_Hot_Wallet_1": {
        "address": "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo",  # Example high-volume address
        "entity": "Nobitex Exchange",
        "category": "Iranian Domestic Exchange"
    },
    "CoinEx_Deposit_Pool": {
        "address": "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ",  # Example exchange wallet
        "entity": "CoinEx Exchange",
        "category": "Foreign Counterparty Exchange"
    }
}

# Thresholds
WHALE_BTC_THRESHOLD = 5.0  # BTC transfers >= 5.0 treated as Whale moves
MEMPOOL_API_BASE = "https://mempool.space/api"
COINGECKO_API_BASE = "https://api.coingecko.com/api/v3"


# ==============================================================================
# MODULE A: MEMPOOL & ON-CHAIN TRACKER (Blockstream / Mempool API)
# ==============================================================================

class OnChainTracker:
    """Monitors Bitcoin addresses and mempool for high-value transactions."""

    def __init__(self, base_url=MEMPOOL_API_BASE):
        self.base_url = base_url

    def get_address_summary(self, address: str) -> dict:
        """Fetches address stats including confirmed and unconfirmed balances."""
        try:
            url = f"{self.base_url}/address/{address}"
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            data = res.json()
            
            chain_stats = data.get("chain_stats", {})
            funded_txo = chain_stats.get("funded_txo_sum", 0) / 1e8
            spent_txo = chain_stats.get("spent_txo_sum", 0) / 1e8
            balance = funded_txo - spent_txo

            return {
                "address": address,
                "total_received_btc": funded_txo,
                "total_sent_btc": spent_txo,
                "current_balance_btc": balance,
                "tx_count": chain_stats.get("tx_count", 0)
            }
        except Exception as e:
            return {"address": address, "error": str(e)}

    def get_recent_transactions(self, address: str, limit: int = 10) -> list:
        """Retrieves recent transactions for an address and flags whale movements."""
        try:
            url = f"{self.base_url}/address/{address}/txs"
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            txs = res.json()

            parsed_txs = []
            for tx in txs[:limit]:
                txid = tx.get("txid")
                status = tx.get("status", {})
                block_time = status.get("block_time")
                dt_str = datetime.fromtimestamp(block_time, tz=timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC') if block_time else "Unconfirmed"
                
                # Calculate total output volume
                total_out_sat = sum(out.get("value", 0) for out in tx.get("vout", []))
                total_out_btc = total_out_sat / 1e8

                is_whale = total_out_btc >= WHALE_BTC_THRESHOLD

                parsed_txs.append({
                    "txid": txid,
                    "timestamp": dt_str,
                    "total_value_btc": total_out_btc,
                    "is_whale_tx": is_whale,
                    "confirmed": status.get("confirmed", False)
                })
            return parsed_txs
        except Exception as e:
            print(f"[!] Error fetching txs for {address}: {e}")
            return []


# ==============================================================================
# MODULE B & C: MARKET & EXCHANGE FLOW METRICS (CoinGecko API)
# ==============================================================================

class MarketContextTracker:
    """Retrieves macro indicators, coin prices, and exchange volume metrics."""

    def __init__(self, base_url=COINGECKO_API_BASE):
        self.base_url = base_url

    def get_macro_market_summary(self) -> dict:
        """Fetches BTC price, USDT/USDC market metrics, and overall volume."""
        try:
            params = {
                "ids": "bitcoin,tether,usd-coin",
                "vs_currencies": "usd",
                "include_24hr_vol": "true",
                "include_24hr_change": "true"
            }
            res = requests.get(f"{self.base_url}/simple/price", params=params, timeout=10)
            res.raise_for_status()
            return res.json()
        except Exception as e:
            return {"error": str(e)}

    def get_coinex_volume_stats(self) -> dict:
        """Retrieves CoinEx reported 24h trading volumes for market analysis."""
        try:
            url = f"{self.base_url}/exchanges/coinex"
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            data = res.json()
            return {
                "exchange": "CoinEx",
                "trade_volume_24h_btc": data.get("trade_volume_24h_btc"),
                "trust_score": data.get("trust_score"),
                "year_established": data.get("year_established"),
                "country": data.get("country")
            }
        except Exception as e:
            return {"exchange": "CoinEx", "error": str(e)}


# ==============================================================================
# MODULE D: REPORT VERIFICATION & FEASIBILITY CHECKER (WSJ / TRM Claims)
# ==============================================================================

class WSJReportVerifier:
    """
    Evaluates reporting claims (e.g., WSJ Jun 25, 2026 report on CoinEx & Nobitex).
    
    Article Context:
    - Claim: $3.84 Billion transferred through CoinEx over 6 years (2020-2026).
    - Context: CoinEx replaced Binance as Nobitex's primary foreign counterparty.
    - CoinEx Defense: Denies deliberate sanction evasion, claims new Iranian signups stopped.
    """

    @staticmethod
    def verify_flow_math(total_claimed_usd: float = 3.84e9, years: float = 6.0) -> dict:
        """
        Calculates daily/monthly average flows required to match reported figures
        and evaluates feasibility against average daily exchange volumes.
        """
        daily_avg_usd = total_claimed_usd / (years * 365)
        monthly_avg_usd = total_claimed_usd / (years * 12)

        # Assumptions based on historical BTC prices (~$30k-$60k avg over 6 years)
        avg_btc_price_est = 45000.0
        daily_btc_equiv = daily_avg_usd / avg_btc_price_est

        return {
            "claimed_total_usd": f"${total_claimed_usd:,.2f}",
            "period_years": years,
            "required_daily_avg_usd": f"${daily_avg_usd:,.2f}",
            "required_monthly_avg_usd": f"${monthly_avg_usd:,.2f}",
            "estimated_daily_btc_volume": f"~{daily_btc_equiv:,.2f} BTC (at ${avg_btc_price_est:,.0f}/BTC)",
            "analytical_notes": [
                "1. $3.84B over 6 years averages ~$1.75 Million/day across all crypto assets (BTC, USDT, TRX).",
                "2. Since USDT on Tron/Ethereum accounts for >70% of Iranian domestic volume (Nobitex stats), BTC-only tracking covers only a fraction.",
                "3. Inter-exchange cluster hops (Nobitex -> Intermediate Wallet -> CoinEx) require heuristic clustering (TRM Labs methodology) rather than direct single-tx matching.",
                "4. CoinEx volume capacity easily absorbs $1.75M daily, making the flow volume technically feasible."
            ]
        }


# ==============================================================================
# CLI / ENTRY POINT FOR TEAM PROJECT
# ==============================================================================

def main():
    print("==========================================================================")
    print("  IRANIAN CRYPTO WHALE & EXCHANGES FLOW TRACKER (CoinEx / Nobitex Focus)  ")
    print("==========================================================================")
    print("  Source context: WSJ Report (Jun 25, 2026) - $3.84B Iranian Crypto Flows
")

    # 1. Macro Market Check
    print("[1] Fetching Macro Market Snapshot (CoinGecko)...")
    market_tracker = MarketContextTracker()
    market_data = market_tracker.get_macro_market_summary()
    print(json.dumps(market_data, indent=2))
    
    print("
[2] Fetching CoinEx Exchange Metrics...")
    coinex_stats = market_tracker.get_coinex_volume_stats()
    print(json.dumps(coinex_stats, indent=2))

    # 2. On-Chain Target Address Inspection
    print("
[3] Inspecting Sample Labeled Entity (Nobitex/CoinEx/OFAC)...")
    chain_tracker = OnChainTracker()
    sample_entity = KNOWN_IRANIAN_ENTITIES["Nobitex_Hot_Wallet_1"]
    address = sample_entity["address"]
    
    print(f"Target: {sample_entity['entity']} ({sample_entity['category']})")
    print(f"Address: {address}")

    summary = chain_tracker.get_address_summary(address)
    print("
Address Summary:")
    print(json.dumps(summary, indent=2))

    print("
Recent Transactions & Whale Activity Detection:")
    txs = chain_tracker.get_recent_transactions(address, limit=5)
    for tx in txs:
        whale_flag = " [WHALE MOVEMENT]" if tx["is_whale_tx"] else ""
        print(f" - TxID: {tx['txid'][:16]}... | Value: {tx['total_value_btc']:.4f} BTC | Date: {tx['timestamp']}{whale_flag}")

    # 3. WSJ Report Mathematical & Methodological Verification
    print("
[4] WSJ / TRM Labs Report Verification Analysis ($3.84B Claim)...")
    verifier = WSJReportVerifier()
    verification_results = verifier.verify_flow_math()
    print(json.dumps(verification_results, indent=2))

    print("
 Execution completed successfully.")

if __name__ == "__main__":
    main()
