package common

import "encoding/json"

func ConvertToJsonString(src any) string {
	buf, _ := json.Marshal(src)
	return string(buf)
}

func ConvertTo(src any, dst any) error {
	switch v := src.(type) {
	case string:
		err := json.Unmarshal([]byte(v), &dst)
		return err
	default:
		buf, err := json.Marshal(src)
		if err != nil {
			return err
		}
		err = json.Unmarshal(buf, &dst)
		return err
	}
}
