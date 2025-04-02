def generate_recommendation(input_data, prediction, confidence):
    """Generate AI recommendations based on the prediction results."""
    country = input_data.get('country', 'the region')
    region = input_data.get('admin1', '')
    actor = input_data.get('actor1', '')
    year = input_data.get('year', '')
    threshold = 0.65

    rec = {
        "ai_recommendation": "",
        "if_no_action": ""
    }

    if prediction == "High Risk":
        rec["ai_recommendation"] = (
            f"[WARNING] Strategic Advisory for {region}, {country}:\n"
            f"- Conflict probability is critically high involving key actor group '{actor}'.\n"
            f"- Immediate action plan:\n"
            f"   • Deploy rapid response peacekeeping units to deter escalation.\n"
            f"   • Initiate structured dialogues with representatives of '{actor}' and neutral mediators.\n"
            f"   • Utilize public communication channels to issue calming, verified information.\n"
            f"   • Increase humanitarian preparedness in vulnerable areas.\n"
            f"- Engage regional and international partners for intelligence coordination."
        )
        rec["if_no_action"] = (
            f"[ALERT] Intelligence Simulation:\n"
            f"- Unchecked risk may lead to widespread unrest and civilian fatalities.\n"
            f"- Escalation may spread to nearby states within 2–4 weeks.\n"
            f"- Economic disruptions and international scrutiny may follow.\n"
            f"- Recommend weekly monitoring if de-escalation efforts are delayed."
        )
    else:
        # Handle low risk scenario
        rec["ai_recommendation"] = (
            f"[STABLE] Stability Assessment for {region}, {country}:\n"
            f"- Current indicators suggest low conflict potential with '{actor}'.\n"
            f"- Recommended measures:\n"
            f"   • Continue standard monitoring protocols.\n"
            f"   • Maintain existing communication channels with local authorities.\n"
            f"   • Consider proactive community engagement to address minor concerns.\n"
            f"- Quarterly reassessment recommended unless conditions change."
        )
        rec["if_no_action"] = (
            f"[TREND] Trend Analysis:\n"
            f"- Region is expected to maintain current stability levels.\n"
            f"- Low probability of security deterioration in next 3 months.\n"
            f"- Standard intelligence gathering sufficient for ongoing assessment.\n"
            f"- Consider background research on historical {actor} activities for context."
        )

    return rec
