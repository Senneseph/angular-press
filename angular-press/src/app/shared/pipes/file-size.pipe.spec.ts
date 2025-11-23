import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  let pipe: FileSizePipe;

  beforeEach(() => {
    pipe = new FileSizePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "0 B" for 0 bytes', () => {
    expect(pipe.transform(0)).toBe('0 B');
  });

  it('should format bytes correctly', () => {
    expect(pipe.transform(100)).toBe('100.00 B');
  });

  it('should format kilobytes correctly', () => {
    expect(pipe.transform(1024)).toBe('1.00 KB');
    expect(pipe.transform(2048)).toBe('2.00 KB');
  });

  it('should format megabytes correctly', () => {
    expect(pipe.transform(1048576)).toBe('1.00 MB');
    expect(pipe.transform(5242880)).toBe('5.00 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(pipe.transform(1073741824)).toBe('1.00 GB');
    expect(pipe.transform(2147483648)).toBe('2.00 GB');
  });

  it('should format terabytes correctly', () => {
    expect(pipe.transform(1099511627776)).toBe('1.00 TB');
  });

  it('should handle decimal values correctly', () => {
    expect(pipe.transform(1536)).toBe('1.50 KB');
    expect(pipe.transform(1572864)).toBe('1.50 MB');
  });
});

