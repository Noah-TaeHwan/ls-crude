from pathlib import Path

import matplotlib.pyplot as plt


OUT = Path(__file__).resolve().parents[2] / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091AGZ" / "figures"
OUT.mkdir(parents=True, exist_ok=True)


def save_hotel_tax() -> None:
    months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
    fy_2223 = [9488.70, 10695.90, 9156.57, 7090.35, 5521.83, 5369.78, 6124.48, 6030.60, 6895.19, 6662.04, 7460.20, 7433.66]
    fy_2324 = [6088.32, 5935.21, 5631.31, 6481.84, 7532.42, 6732.34, 6124.03, 5721.58, 6866.02, 7619.14, 9524.08, 7179.17]
    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.plot(months, fy_2223, marker="o", label="FY 2022/23")
    ax.plot(months, fy_2324, marker="o", label="FY 2023/24")
    ax.set_title("Cushing Hotel/Motel Tax — official 24-month sample")
    ax.set_ylabel("USD collected")
    ax.set_xlabel("Month reported")
    ax.grid(axis="y", alpha=0.3)
    ax.legend()
    fig.tight_layout()
    fig.savefig(OUT / "091a-hotel-motel-tax-sample.svg", format="svg")
    plt.close(fig)


def save_police_calls() -> None:
    months = ["2023-06", "2023-07", "2023-08"]
    calls_911 = [378, 351, 249]
    police_cfs = [1205, 1110, 1109]
    fig, ax = plt.subplots(figsize=(7.5, 4.5))
    ax.plot(months, calls_911, marker="o", label="911 calls")
    ax.plot(months, police_cfs, marker="o", label="Police calls for service")
    ax.set_title("Cushing public-safety aggregates — official 3-month sample")
    ax.set_ylabel("Monthly aggregate calls")
    ax.set_xlabel("Month")
    ax.grid(axis="y", alpha=0.3)
    ax.legend()
    fig.tight_layout()
    fig.savefig(OUT / "091g-police-calls-sample.svg", format="svg")
    plt.close(fig)


if __name__ == "__main__":
    save_hotel_tax()
    save_police_calls()
