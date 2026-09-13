"""재수집 감사가 잘못된 응답·중복을 거부하고 결측을 0으로 만들지 않는지 검사한다."""
import copy
import importlib.util
import sys
from pathlib import Path

import pytest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("audit_dmr_refresh", SCRIPTS / "audit_dmr_refresh.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


def test_refresh_scope_missing_duplicates_and_saved_comparison(tmp_path):
    import json
    item = dict(MonitoringPeriodEndDate="31-JAN-23", StatisticalBaseDesc="DAILY MX", DMRUnitDesc="MGD",
                DMRValueNmbr="1.2", ValueReceivedDate="03-FEB-23", DMRValueQualifierCode="=")
    doc = {"Results": dict(SourceId="OK0026701", CWPCity="CUSHING", CWPState="OK", StartDate="01/01/2023", EndDate="12/31/2023",
                           PermFeatures=[dict(PermFeatureNmbr="001", Parameters=[dict(ParameterCode="50050", MonitoringLocationDesc="Effluent Gross", DischargeMonitoringReports=[item])])])}
    assert audit.extract(doc)[0]["value_num"] == "1.2"
    for key, value in [("MonitoringPeriodEndDate", "31-JAN-24"), ("DMRUnitDesc", "gal/d"), ("DMRValueQualifierCode", "<"), ("DMRValueNmbr", "NaN"), ("ValueReceivedDate", None)]:
        old = item.get(key); item[key] = value
        with pytest.raises(ValueError):
            audit.extract(doc)
        item[key] = old
    item["NODICode"] = "C"
    assert audit.extract(doc)[0]["value_num"] == ""
    item.pop("NODICode")
    reports = doc["Results"]["PermFeatures"][0]["Parameters"][0]["DischargeMonitoringReports"]
    reports.append(copy.deepcopy(item))
    with pytest.raises(ValueError, match="중복"):
        audit.extract(doc)
    reports.pop()
    raw = tmp_path / "raw.json"; raw.write_text(json.dumps(doc))
    baseline = tmp_path / "baseline.csv"; baseline.write_text("date,value,available_at\n2023-01-31,1.2,2023-02-03\n")
    out = tmp_path / "out"
    audit.audit(raw, baseline, out)
    result = json.loads((out / "audit.json").read_text())
    assert result["comparison"]["common_rows"] == 1
    assert result["comparison"]["changed_value_or_receipt_dates"] == []
    assert result["stats"]["DAILY MX"]["missing_months"] == list(range(2, 13))
    with pytest.raises(FileExistsError):
        audit.audit(raw, baseline, out)
