import moviepy.editor as mp
import sys
import os

videoId = sys.argv[1]
print(os.path.realpath(os.getcwd()))
print(os.getcwd() + "heheh")
filePath = "/Users/lam268/Desktop/hocmai-poc/ttlab-hocmai-backend/src/files"
# read video
my_clip = mp.VideoFileClip("{}/{}/{}.mp4".format(filePath ,videoId, videoId))
print(my_clip.duration)
# extract audio
audio = my_clip.audio.write_audiofile("{}/{}/{}.mp3".format(filePath, videoId, videoId))
