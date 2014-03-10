Hexadecimal is a terrible way to express a UUID.

The most common type of UUID (4) is composed of 122 bits of random data + 6 bits of fluff.

Let's look at some of the other, better, ways we can express those 122 bits.

- base64 - is expressable in urls and databases, and packs into significantly fewer characters.  Base64 is a good choice if your putting your UUID in a url or storing it as a string
- bitmap - If your language and database supports it, you can store the 122 random bits directly.  This will be much smaller than storing the UUID as a string, and comparisons may be faster.
- words - You can map the bit sequence to words.  As words it's much easier to transcribe, compare and remember UUIDs.
