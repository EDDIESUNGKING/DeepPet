# 內附資料字典

- `index`：內建寵物ID(0–29)，不可單靠位置判斷Lucky或New Pet。
- `species`：dog或cat。
- `days[].date`：當地日期字串，YYYY-MM-DD。
- `days[].quality.valid`：該日是否具有有效量測。
- `days[].signalStatus`：valid/缺測原因，只能作資料品質提示，不是疾病診斷。
- `days[].observations`：部分原始情境觀察數值，僅在有效時提供。
- `days[].featureEvidence`：評分所用特徵的稽核快照。
- `days[].scores`：從同套評分公式推導的每日分數，缺測為null。
- `Overview.validDays/missingDays`：30天窗口內有效和缺測天數。
- `snapshotDate`：資料匯出的時間點，不保證不同日期再次開啟的即時分數完全相同。

這些都是本機測試資料或稽核輸出，未建立遠端雲端資料庫。
