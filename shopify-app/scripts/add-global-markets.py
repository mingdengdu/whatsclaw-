#!/usr/bin/env python3
"""
WhatsClaw + Shopify — Global Top 30 Markets
WhatsApp active countries sorted by ecommerce + WhatsApp penetration
"""

TOP30 = [
    # Code, Name, WhatsApp rank, Shopify merchants (est)
    ("US", "United States",   "top5",  "2.1M"),
    ("GB", "United Kingdom",  "top10", "300K"),
    ("CA", "Canada",          "top10", "200K"),
    ("AU", "Australia",       "top15", "180K"),
    ("DE", "Germany",         "top10", "250K"),
    ("FR", "France",          "top10", "200K"),
    ("IN", "India",           "top1",  "150K"),
    ("BR", "Brazil",          "top1",  "200K"),
    ("MX", "Mexico",          "top3",  "150K"),
    ("AR", "Argentina",       "top3",  "80K"),
    ("ES", "Spain",           "top5",  "120K"),
    ("IT", "Italy",           "top5",  "100K"),
    ("NL", "Netherlands",     "top15", "80K"),
    ("JP", "Japan",           "top20", "100K"),
    ("KR", "South Korea",     "top20", "80K"),
    ("SG", "Singapore",       "top10", "30K"),
    ("HK", "Hong Kong",       "top10", "25K"),
    ("MY", "Malaysia",        "top5",  "40K"),
    ("ID", "Indonesia",       "top3",  "80K"),
    ("TH", "Thailand",        "top10", "50K"),
    ("PH", "Philippines",     "top5",  "40K"),
    ("VN", "Vietnam",         "top10", "30K"),
    ("PK", "Pakistan",        "top3",  "20K"),
    ("NG", "Nigeria",         "top3",  "20K"),
    ("ZA", "South Africa",    "top5",  "25K"),
    ("EG", "Egypt",           "top5",  "20K"),
    ("SA", "Saudi Arabia",    "top5",  "30K"),
    ("AE", "UAE",             "top5",  "30K"),
    ("TR", "Turkey",          "top5",  "40K"),
    ("PL", "Poland",          "top15", "50K"),
]

# Just the codes for Shopify API
codes = [c[0] for c in TOP30]
print("Country codes:", codes)
print(f"Total: {len(codes)} countries")
